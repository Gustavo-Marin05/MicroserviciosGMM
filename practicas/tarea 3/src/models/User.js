const mongoose = require("mongoose");

// En esta sección irá todo lo que es sobre la tabla de usuarios
const userSchema = mongoose.Schema({
  nombres: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    required: true,
  },
  fecha_nacimiento: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  celular: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
