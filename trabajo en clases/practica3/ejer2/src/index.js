import express from "express";
import { createPool } from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//coneccion a la base de datos
const pool = createPool({
  host: "db",
  user: "root",
  password: "123456",
  port: 3306,
});

//CREACION DE LAS RUTAS
//ruta para mostrar los usuarios
app.get("/user", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.render("list", { usuarios: rows });
  } catch (error) {
   console.error("❌ Error en /user:", error.message);
    res.status(500).send("Error al obtener usuarios");
  }
});

//ruta para mostrar el formulario
app.get("/add", async (req, res) => {
  res.render("add");
});
//ruta para agregar el usuario
app.post("/add", async (req, res) => {
  const { nombres, correo } = req.body;
  await pool.query(
    "INSERT INTO usuarios (nombres, correo, fecha_registro) VALUES (?, ?, NOW())",
    [nombres, correo]
  );
  res.redirect("/user");
});

//ruta para borrar el ususario
app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params; // obtenemos el id desde la URL

    // Ejecutamos DELETE en MySQL
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);

    // Redirigimos a la lista de usuarios
    res.redirect("/user");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar el usuario");
  }
});

//ruta para editar usuarios

//renderizar el formulario para editar
app.get("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
      id,
    ]);
    res.render("edit", { usuario: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send("error al editar el usurio");
  }
});

//edita el user
app.post("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, correo } = req.body;

    await pool.query("UPDATE usuarios SET nombres=? ,correo=? WHERE id =?", [
      nombres,
      correo,
      id,
    ]);

    res.redirect("/user");
  } catch (error) {
    console.error(error);
    res.status(500).send("error al editar el usurio");
  }
});

//puesto que se esta escuchando
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado al puerto ${PORT}`);
});
