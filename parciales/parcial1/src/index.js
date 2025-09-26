import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Trabajador from "./models/trabajador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//RUTAS PARA EL TRABAJADOR

//obtener todos los trabajadores

app.get("/trabajador", async (req, res) => {
  try {
    const trabajador = await Trabajador.find();
    res.json(trabajador);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los trabajadores");
  }
});

//crear un trabajador

app.post("/trabajador", async (req, res) => {
  try {
    const { nombre, apellido, ci, cargo, departamento, fechaingreso } =
      req.body;
    const nuevoTrabajador = new Trabajador({
      nombre,
      apellido,
      ci,
      cargo,
      departamento,
      fechaingreso,
    });

    await nuevoTrabajador.save();
    res.json(nuevoTrabajador);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar los trabajadores");
  }
});

//actualizacion del trabajador
app.put("/trabajador/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, ci, cargo, departamento, fechaingreso } =
      req.body;
    const trabajador = await Trabajador.findByIdAndUpdate(id, {
      nombre,
      apellido,
      ci,
      cargo,
      departamento,
      fechaingreso,
    });
    res.json(trabajador);

    if (!trabajador) {
      return res.status(404).send("trabajador no encontrado");
    }
  } catch (error) {
    console.error(error);
    res.status(400).send("error al actualizar el trabajador");
  }
});

//eliminar un trabajador

app.delete("/trabajador/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Trabajador.findByIdAndDelete(id);
    res.send("trabajador eliminado");
  } catch (error) {
    console.error(error)
    res.status(400).send('error a eliminar el trabajador')
  }
});

//coneccion a la base de datos
//localhost:27017
//mongo:27017   esto para el docker
mongoose
  .connect("mongodb://localhost:27017/trabajador")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

//coneccion al pueto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Conectado al puerto ${PORT}`);
});
