const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Rutas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const alertasRoutes = require('./routes/alertasRoutes');
const aemetRoutes = require('./routes/aemetRoutes');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// 🔧 Middleware para forzar codificación UTF-8 en respuestas JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/aemet', aemetRoutes); 

// Enrutamiento frontend
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Conexión BBDD
const sequelize = new Sequelize(process.env.DB_URI);
sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(error => console.error('Error al conectar a la BBDD:', error));

// Carga y ejecuta el cron de envío de alertas
require('./jobs/sendAlertsJob');

// Arrancar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});
