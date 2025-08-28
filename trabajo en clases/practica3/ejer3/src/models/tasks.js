import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
  fecha_limite: { type: Date }   
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
