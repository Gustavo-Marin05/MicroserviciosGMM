# 1️⃣ Imagen base
FROM node:20

# 2️⃣ Crear directorio de la app
WORKDIR /usr/src/app

# 3️⃣ Copiar package.json y package-lock.json
COPY package*.json ./

# 4️⃣ Copiar node_modules locales al contenedor
COPY node_modules ./node_modules

# 5️⃣ Copiar el resto del código
COPY . .

# 6️⃣ Exponer el puerto
EXPOSE 4000

# 7️⃣ Comando por defecto
CMD ["node", "index.js"]


#toma en cuenta que desde este docker file lo que esta haciendo es copias las dependencias 
#asi no se es nesesario de internet para poder descargat todo
