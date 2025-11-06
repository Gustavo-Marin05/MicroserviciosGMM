require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();
const { User } = require('./User.js');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'authuser',
  password: process.env.DB_PASSWORD || 'authpass',
  database: process.env.DB_NAME || 'authdb',
  entities: [User],
  synchronize: true, // ⚠️ solo para desarrollo
  logging: false,
});

module.exports = { AppDataSource };
