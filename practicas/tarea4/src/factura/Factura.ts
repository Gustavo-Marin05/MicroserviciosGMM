import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Cliente } from "../cliente/Cliente";
import { DetalleFactura } from "./DetalleFactura";

@Entity()
export class Factura {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "timestamp" })
  fecha!: Date;

  // cargamos cliente al pedir factura
  @ManyToOne(() => Cliente, c => c.facturas, { eager: true, onDelete: "RESTRICT" })
  cliente!: Cliente;

  // no eager para evitar ciclos; cargaremos detalles explícitamente en queries/services
  @OneToMany(() => DetalleFactura, d => d.factura, { cascade: true })
  detalles!: DetalleFactura[];
}
