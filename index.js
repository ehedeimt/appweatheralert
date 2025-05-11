/*
index.js --> Archivo principal del backend.
Funciones:
- Configura y lanza el servidor Express.
- Conecta con la base de datos PostgreSQL mediante Sequelize.
- Monta rutas para API REST (/auth, /alertas, /aemet).
- Sirve archivos del frontend desde la carpeta /frontend.
- Inicia una tarea automática de envío de alertas por email.

Requiere variables en .env:
- PORT - Conexión a la BBDD.
- DB_URI - Conexión a la BBDD.
- JWT_SECRET - Clave configurada para manejo de los Tokens JWT.
- AEMET_API_KEY - Varibable entorno configurada con la API KEY facilitada por la AEMET.
- EMAIL_USER / EMAIL_PASS - Credenciales de la cuenta de correo con la que se manejarán los envíos.
 */

//CONFIGURACIONES E IMPORTACIONES PRINCIPALES.
//Carga los modulos de Express, Node y Sequelize.
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Rutas
//const userRoutes = require('./routes/userRoutes');
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
//app.use('/api/users', userRoutes);
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
