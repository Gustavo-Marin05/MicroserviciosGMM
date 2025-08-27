import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function calcular(a, b, op) {
  const x = Number(a);
  const y = Number(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return { error: "Valores inválidos" };

  switch (op) {
    case "sumar": return { resultado: x + y };
    case "restar": return { resultado: x - y };
    case "multiplicar": return { resultado: x * y };
    case "dividir":
      if (y === 0) return { error: "No se puede dividir entre cero" };
      return { resultado: x / y };
    default:
      return { error: "Operación no válida" };
  }
}

app.post("/calc", (req, res) => {
  const { a, b, operacion } = req.body;
  const resultado = calcular(a, b, operacion);
  res.json(resultado);
});

app.listen(PORT, () => {
  console.log(`Calculadora escuchando en http://localhost:${PORT}`);
});
