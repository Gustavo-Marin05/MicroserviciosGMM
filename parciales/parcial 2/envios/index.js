import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { pool } from './db.js';

const typeDefs = gql`
  type Envio {
    id: ID!
    usuario_id: Int!
    vehiculo_id: Int!
    origen: String!
  }

  type Query {
    envios: [Envio]
    envio(id: ID!): Envio
  }

  type Mutation {
    crearEnvio(usuario_id: Int!, vehiculo_id: Int!, origen: String!): Envio
  }
`;

const resolvers = {
  Query: {
    envios: async () => {
      const [rows] = await pool.query('SELECT * FROM envios');
      return rows;
    },
    envio: async (_, { id }) => {
      const [rows] = await pool.query('SELECT * FROM envios WHERE id = ?', [id]);
      return rows[0];
    }
  },
  Mutation: {
    crearEnvio: async (_, { usuario_id, vehiculo_id, origen }) => {
      const [result] = await pool.query(
        'INSERT INTO envios (usuario_id, vehiculo_id, origen) VALUES (?, ?, ?)',
        [usuario_id, vehiculo_id, origen]
      );
      return { id: result.insertId, usuario_id, vehiculo_id, origen };
    }
  }
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
