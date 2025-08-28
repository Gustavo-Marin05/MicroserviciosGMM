import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Task from "./models/tasks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//RUTA DE TAREAS
//obtener todas las tareas
app.get("/task", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render("listar", { tareas: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar las tareas");
  }
});

//RUTAS PARA CREACION DE LA TAREA
//renderiza el formulario
app.get("/task/add", (req, res) => {
  res.render("add");
});

//guarda la tarea
app.post("/task/add", async (req, res) => {
  try {
    const { titulo, descripcion, estado, fecha_limite } = req.body;
    const nuevatarea = new Task({
      titulo,
      descripcion,
      estado,
      fecha_limite,
    });
    await nuevatarea.save();
    res.redirect("/task");
  } catch (error) {
    console.error(error);
    res.status(500).send("error al crear la tarea");
  }
});

//ruta para elimitar la tarea

app.get("/task/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.redirect("/task");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar la tarea");
  }
});

//ruta para editar las tareas
app.get("/task/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).send("tarea no encontrada");
    }
    res.render("edit", { tarea: task });
  } catch (error) {
    console.error(error);
    res.status(500).send("error al cargar el formulario");
  }
});

//ruta que editar el usuario
app.post("/task/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, fecha_limite } = req.body;
  try {
    await Task.findByIdAndUpdate(id, {
      titulo,
      descripcion,
      estado,
      fecha_limite,
    });
    res.redirect('/task')
  } catch (error) {
    console.error(error);
    res.status(500).send("error al actualizar la tarea");
  }
});

// CONEXIÓN A LA BASE DE DATOS
//local:mongodb://localhost:27017/taskdb
//produccion: mongodb://mongo:27017/taskdb
mongoose
  .connect("mongodb://mongo:27017/taskdb")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado al puerto ${PORT}`);
});
