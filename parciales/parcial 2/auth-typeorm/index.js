require('reflect-metadata');
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AppDataSource } = require('./data-source');
const { User } = require('./User.js');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_demo';

// 🧠 Conectar a la base de datos
AppDataSource.initialize()
  .then(() => console.log('✅ Database connected with TypeORM'))
  .catch((err) => console.error('❌ Error connecting DB:', err));

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'Auth service running' }));



// 🔐 Signup
app.post('/signup', async (req, res) => {
  try {
    const { name, password, correo } = req.body;
    if (!name || !password || !correo) return res.status(400).json({ error: 'Faltan datos' });

    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({ where: [{ name }, { correo }] });
    if (existing) return res.status(400).json({ error: 'Usuario o correo ya existen' });

    const hashed = await bcrypt.hash(password, 10);
    const user = repo.create({ name, password: hashed, correo });
    await repo.save(user);


    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error('Error en signup:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔑 Login
app.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { name } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ name, correo: user.correo }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 👤 Profile
app.get('/profile', async (req, res) => {
  try {
    const name = req.headers['x-user'];
    if (!name) return res.status(401).json({ error: 'No autorizado' });

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({
      select: ['id', 'name', 'correo', 'created_at'],
      where: { name },
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    console.error('Error en profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(4000, () => console.log('✅ Auth service running on port 4000'));
