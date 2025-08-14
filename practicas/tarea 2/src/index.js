const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const User = require("./models/User");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// CONEXIÓN A LA BASE DE DATOS
mongoose
  .connect("mongodb://localhost:27017/Databases")
  .then(() => {
    console.log("Conectado a MongoDB");
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
  });

// RUTAS DESDE ESTE PUNTO

//ruta de mostrar todos los usuaros
app.get("/user", async (req, res) => {
  const users = await User.find();
  if (!users) throw new Error("No hay usuarios registrados");
  res.render("listar", { usuarios: users }); //aqui le paso users como usuarios por que el la view recibe usuarios
});

//ruta para renderzar el formularo agregar
app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  try {
    const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;

    
    if (!nombres || !apellidos || !fecha_nacimiento || !direccion || !celular || !correo) {
      return res.status(400).send("Todos los campos son obligatorios");
    }

    const nuevoUsuario = new User({
      nombres,
      apellidos,
      fecha_nacimiento,
      direccion,
      celular,
      correo
    });

    await nuevoUsuario.save(); // guardamos en la base de datos

    res.redirect("/user"); // redirigimos a la lista de usuarios
  } catch (err) {
    console.error("Error al agregar usuario:", err);
    res.status(500).send("Error al agregar usuario");
  }
});


//ruta para borrar usuaro
app.get('/user/:id',async(req,res)=>{
  const {id}=req.params;
  try {
    const usuario = await User.findByIdAndDelete(id)
    res.redirect('/user');
  } catch (error) {
    res.status(500).send('error al eliminar el usuario')
  }
})


//ruta para editar el usuario
app.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.render('edit', { usuario }); // renderiza la vista edit.ejs con los datos del usuario
  } catch (error) {
    console.error("Error al cargar el usuario:", error);
    res.status(500).send("Error al cargar el usuario");
  }
});

app.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;

  try {
    await User.findByIdAndUpdate(id, {
      nombres,
      apellidos,
      fecha_nacimiento,
      direccion,
      celular,
      correo
    });
    res.redirect('/user'); // redirige a la lista después de actualizar
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).send("Error al actualizar el usuario");
  }
});






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado al puerto ${PORT}`);
});
