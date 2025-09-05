import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Factura } from "../factura/Factura";

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  ci!: string;

  @Column()
  nombres!: string;

  @Column()
  apellidos!: string;

  @Column({ length: 1 })
  sexo!: "M" | "F";

  @OneToMany(() => Factura, f => f.cliente)
  facturas!: Factura[];
}
