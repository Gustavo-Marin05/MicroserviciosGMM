import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { DetalleFactura } from "../factura/DetalleFactura";

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  descripcion?: string;

  @Column()
  marca!: string;

  @Column("int")
  stock!: number;

  @OneToMany(() => DetalleFactura, d => d.producto)
  detalles!: DetalleFactura[];
}
