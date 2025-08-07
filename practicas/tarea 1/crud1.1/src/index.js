const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//ruta para mostrar todos los usuaros
app.get("/user", (req, res) => {
  const query = "SELECT * FROM usuarios";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.render("listar", { usuarios: results });
  });
});

//RUTAS PARA AÑADIR

// Mostrar formulario para agregar producto
app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } =
    req.body;
  const query =
    "INSERT INTO usuarios (nombres,apellidos,fecha_nacimiento,direccion,celular,correo) VALUES (?, ?, ?,?,?,?)";
  db.query(
    query,
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo],
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect("/user");
    }
  );
});

//RUTAS PARA ELIMINAR
app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM usuarios WHERE id = ?";

  db.query(query, [id], (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/user");
  });
});

//RUTAS PARA EDITAR UN USUARIO

//invocar el formulario

app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM usuarios WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0)
      return res.status(404).send("Usuario no encontrado");

    const usuario = results[0];
    res.render("edit", { usuario });
  });
});

app.post("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } =
    req.body;

  const query = `
    UPDATE usuarios
    SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, direccion = ?, celular = ?, correo = ?
    WHERE id = ?`;

  db.query(
    query,
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo, id],
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect("/user");
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado al puerto ${PORT}`);
});
