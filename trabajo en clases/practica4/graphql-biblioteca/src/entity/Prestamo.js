const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Prestamo",
  tableName: "prestamo",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    usuario: { type: String },
    fecha_prestamo: { type: "date" },
    fecha_devolucion: { type: "date" },
  },
  relations: {
    libro: {
      type: "many-to-one",
      target: "Libro",
      joinColumn: true,
      inverseSide: "prestamos",
    },
  },
});
