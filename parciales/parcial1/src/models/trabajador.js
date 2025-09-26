import mongoose from 'mongoose';

const trabajadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String },
  ci: { type: String},
  cargo: { type: String },
  departamento: { type: String },
  fechaingreso: { type: Date, default: Date.now },  
});

const Trabajador = mongoose.model("Trabajador", trabajadorSchema);
export default Trabajador;
