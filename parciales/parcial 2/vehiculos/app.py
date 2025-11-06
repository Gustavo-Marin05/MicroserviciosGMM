from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import os

app = Flask(__name__)

# Configuración de MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['vehiculos_db']
vehiculos_collection = db['vehiculos']

# Validar datos del vehículo
def validar_vehiculo(data, es_actualizacion=False):
    errores = []
    
    if not es_actualizacion and not data.get('placa'):
        errores.append('La placa es obligatoria')
    
    if 'tipo' in data and data['tipo'] not in ['sedán', 'suv', 'camión', 'moto', 'van']:
        errores.append('Tipo debe ser: sedán, suv, camión, moto o van')
    
    if 'capacidad' in data:
        try:
            capacidad = int(data['capacidad'])
            if capacidad < 1 or capacidad > 100:
                errores.append('Capacidad debe estar entre 1 y 100')
        except (ValueError, TypeError):
            errores.append('Capacidad debe ser un número')
    
    if 'estado' in data and data['estado'] not in ['disponible', 'en_uso', 'mantenimiento', 'fuera_de_servicio']:
        errores.append('Estado debe ser: disponible, en_uso, mantenimiento o fuera_de_servicio')
    
    return errores

# Convertir ObjectId a string para JSON
def serializar_vehiculo(vehiculo):
    vehiculo['_id'] = str(vehiculo['_id'])
    return vehiculo

# Health check
@app.route('/health', methods=['GET'])
def health():
    try:
        # Verificar conexión a MongoDB
        client.admin.command('ping')
        return jsonify({
            'status': 'Vehicle service running',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'Vehicle service running',
            'database': 'disconnected',
            'error': str(e)
        }), 503

# CREATE - Crear un vehículo
@app.route('/vehiculos', methods=['POST'])
def crear_vehiculo():
    try:
        data = request.get_json()
        
        # Validar datos
        errores = validar_vehiculo(data)
        if errores:
            return jsonify({'error': 'Datos inválidos', 'detalles': errores}), 400
        
        # Verificar si la placa ya existe
        if vehiculos_collection.find_one({'placa': data['placa']}):
            return jsonify({'error': 'Ya existe un vehículo con esa placa'}), 409
        
        # Crear vehículo
        vehiculo = {
            'placa': data['placa'].upper(),
            'tipo': data.get('tipo', 'sedán'),
            'capacidad': int(data.get('capacidad', 4)),
            'estado': data.get('estado', 'disponible'),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = vehiculos_collection.insert_one(vehiculo)
        vehiculo['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Vehículo creado exitosamente',
            'vehiculo': serializar_vehiculo(vehiculo)
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# READ - Obtener todos los vehículos
@app.route('/vehiculos', methods=['GET'])
def obtener_vehiculos():
    try:


        # Filtros opcionales
        filtros = {}
        
        if request.args.get('tipo'):
            filtros['tipo'] = request.args.get('tipo')
        
        if request.args.get('estado'):
            filtros['estado'] = request.args.get('estado')
        
        if request.args.get('capacidad_min'):
            filtros['capacidad'] = {'$gte': int(request.args.get('capacidad_min'))}
        
        vehiculos = list(vehiculos_collection.find(filtros))
        
        return jsonify({
            'total': len(vehiculos),
            'vehiculos': [serializar_vehiculo(v) for v in vehiculos]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# READ - Obtener un vehículo por ID
@app.route('/vehiculos/<id>', methods=['GET'])
def obtener_vehiculo(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'ID inválido'}), 400
        
        vehiculo = vehiculos_collection.find_one({'_id': ObjectId(id)})
        
        if not vehiculo:
            return jsonify({'error': 'Vehículo no encontrado'}), 404
        
        return jsonify(serializar_vehiculo(vehiculo)), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# READ - Obtener vehículo por placa
@app.route('/vehiculos/placa/<placa>', methods=['GET'])
def obtener_vehiculo_por_placa(placa):
    try:
        vehiculo = vehiculos_collection.find_one({'placa': placa.upper()})
        
        if not vehiculo:
            return jsonify({'error': 'Vehículo no encontrado'}), 404
        
        return jsonify(serializar_vehiculo(vehiculo)), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# UPDATE - Actualizar un vehículo
@app.route('/vehiculos/<id>', methods=['PUT'])
def actualizar_vehiculo(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'ID inválido'}), 400
        
        data = request.get_json()
        
        # Validar datos
        errores = validar_vehiculo(data, es_actualizacion=True)
        if errores:
            return jsonify({'error': 'Datos inválidos', 'detalles': errores}), 400
        
        # Verificar si existe
        vehiculo_existente = vehiculos_collection.find_one({'_id': ObjectId(id)})
        if not vehiculo_existente:
            return jsonify({'error': 'Vehículo no encontrado'}), 404
        
        # Si se cambia la placa, verificar que no exista
        if 'placa' in data and data['placa'] != vehiculo_existente['placa']:
            if vehiculos_collection.find_one({'placa': data['placa'].upper(), '_id': {'$ne': ObjectId(id)}}):
                return jsonify({'error': 'Ya existe un vehículo con esa placa'}), 409
        
        # Preparar actualización
        actualizacion = {'updated_at': datetime.now()}
        
        if 'placa' in data:
            actualizacion['placa'] = data['placa'].upper()
        if 'tipo' in data:
            actualizacion['tipo'] = data['tipo']
        if 'capacidad' in data:
            actualizacion['capacidad'] = int(data['capacidad'])
        if 'estado' in data:
            actualizacion['estado'] = data['estado']
        
        vehiculos_collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': actualizacion}
        )
        
        vehiculo_actualizado = vehiculos_collection.find_one({'_id': ObjectId(id)})
        
        return jsonify({
            'message': 'Vehículo actualizado exitosamente',
            'vehiculo': serializar_vehiculo(vehiculo_actualizado)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# PATCH - Actualización parcial del estado
@app.route('/vehiculos/<id>/estado', methods=['PATCH'])
def cambiar_estado(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'ID inválido'}), 400
        
        data = request.get_json()
        nuevo_estado = data.get('estado')
        
        if not nuevo_estado or nuevo_estado not in ['disponible', 'en_uso', 'mantenimiento', 'fuera_de_servicio']:
            return jsonify({'error': 'Estado inválido'}), 400
        
        result = vehiculos_collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': {'estado': nuevo_estado, 'updated_at': datetime.now()}}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Vehículo no encontrado'}), 404
        
        vehiculo = vehiculos_collection.find_one({'_id': ObjectId(id)})
        
        return jsonify({
            'message': 'Estado actualizado exitosamente',
            'vehiculo': serializar_vehiculo(vehiculo)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# DELETE - Eliminar un vehículo
@app.route('/vehiculos/<id>', methods=['DELETE'])
def eliminar_vehiculo(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({'error': 'ID inválido'}), 400
        
        result = vehiculos_collection.delete_one({'_id': ObjectId(id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Vehículo no encontrado'}), 404
        
        return jsonify({'message': 'Vehículo eliminado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor', 'detalles': str(e)}), 500

# Middleware de logs
@app.before_request
def log_request():
    print(f"[{datetime.now().isoformat()}] {request.method} {request.path}")

if __name__ == '__main__':
    print("🚀 Iniciando servicio de vehículos...")
    print(f"📊 Base de datos: {db.name}")
    try:
        client.admin.command('ping')
        print("✅ Conexión a MongoDB exitosa")
    except Exception as e:
        print(f"⚠️  Advertencia: No se pudo conectar a MongoDB - {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

