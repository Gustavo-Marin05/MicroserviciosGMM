import "reflect-metadata";
import { DataSource } from "typeorm";
import { Producto } from "./producto/Producto";
import { Cliente } from "./cliente/Cliente";
import { Factura } from "./factura/Factura";
import { DetalleFactura } from "./factura/DetalleFactura";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "bd_tienda",
  synchronize: true, // solo DEV
  logging: false,
  entities: [Producto, Cliente, Factura, DetalleFactura],
});
