import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import productoRouter from './producto/produto.routes' ;
import clienteRouter from "./cliente/cliente.route";
import facturaRouter from "./factura/factura.route";
import { errorMiddleware } from "./common/error.middleware";

const app = express();
const PORT = 3000;

app.use(express.json());
app.get("/", (_req, res) => res.send("API Ventas OK"));

AppDataSource.initialize()
  .then(() => {
    app.use("/productos", productoRouter);
    app.use("/clientes", clienteRouter);
    app.use("/facturas", facturaRouter);

    // middleware error al final
    app.use(errorMiddleware);

    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error("Error DB:", err));
