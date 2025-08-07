import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { Usuarios } from "./entity/User";
import path from "path";


const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

;
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'ejs')
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión con la base de datos establecida.");



    // OBTENEMOS TODOS LOS USUARIOS EN UNA TABLA
    app.get("/users", async (req, res) => {
      const usuarios = await AppDataSource.manager.find(Usuarios);
      res.render("listar", { usuarios });
    });


    //ME MOSTRARA EL FORMULARIO PARA AGREGAR
    app.get("/add", (req, res) => {
      res.render("add");
    });

    // GUARDA EN LA BASE DE DATOS 
    app.post("/add", async (req, res) => {
      const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } =
        req.body;

      try {
        const usuarios = await AppDataSource.manager.create(Usuarios, {
          nombres,
          apellidos,
          fecha_nacimiento,
          direccion,
          celular,
          correo,
        })

        await AppDataSource.manager.save(usuarios);

        res.redirect("/users");
      } catch (error) {
        res.status(500).send("Error al crear el usuario");
      }

    });

    //ELIMINACION DE UN USUARIO
    app.get('/user/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const usuarios = await AppDataSource.manager.delete(Usuarios, id)
        if (!usuarios) return res.status(400).send("Usuario no encontrado");

        res.redirect('/users')
      } catch (error) {
        res.status(500).send("Error al eliminar usuario");
      }
    })



    //EDITAR AL USUARIO

    app.get('/edit/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const usuario = await AppDataSource.manager.findOneBy(Usuarios, { id: Number(id) })

        if (!usuario) {
          return res.status(404).send("Usuario no encontrado");
        }

        res.render("edit", { usuario });

      } catch (error) {
        res.status(500).send('falla al obtener el formulario')
      }
    })


    app.post("/edit/:id", async (req, res) => {
      const { id } = req.params;
      const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;

      try {
        const result = await AppDataSource.manager.update(Usuarios, { id: Number(id) }, {
          nombres,
          apellidos,
          fecha_nacimiento,
          direccion,
          celular,
          correo,
        });

        if (result.affected === 0) {
          return res.status(404).send("Usuario no encontrado.");
        }

        res.redirect("/users");
      } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).send("Error al actualizar el usuario.");
      }
    });










    //PUERTO DE LA APLICACION
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar a la base de datos:", error);
  });
