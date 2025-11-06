const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
    correo:{
      type:'varchar',
      unique: true
    },
    role: {
      type: 'varchar',
      default: 'admin',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
});

module.exports = { User };
