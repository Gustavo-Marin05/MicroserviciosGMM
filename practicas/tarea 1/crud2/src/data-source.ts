import "reflect-metadata"
import { DataSource } from "typeorm"
import { Usuarios } from "./entity/User"


export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "bd_agenda",
    synchronize: true,
    logging: false,
    entities: [Usuarios],
    migrations: [],
    subscribers: [],
})
