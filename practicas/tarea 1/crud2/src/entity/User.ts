import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Usuarios {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombres: string

    @Column()
    apellidos: string

    @Column()
    fecha_nacimiento: string
    @Column()
    direccion: string

    @Column()
    celular: string


    @Column()
    correo: string
}
