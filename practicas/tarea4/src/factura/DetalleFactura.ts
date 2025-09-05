import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Factura } from "./Factura";
import { Producto } from "../producto/Producto";

@Entity()
export class DetalleFactura {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Factura, f => f.detalles, { onDelete: "CASCADE" })
  factura!: Factura;

  // eager en producto para que detalle incluya info del producto
  @ManyToOne(() => Producto, p => p.detalles, { eager: true, onDelete: "RESTRICT" })
  producto!: Producto;

  @Column("int")
  cantidad!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  precio!: string; // usar string para decimals
}
