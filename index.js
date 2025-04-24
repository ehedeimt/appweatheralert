const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
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

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/aemet', aemetRoutes);

// Enrutamiento frontend (SPA)
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Conexión a la base de datos
const sequelize = new Sequelize(process.env.DB_URI);

sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.log('No se pudo conectar a la base de datos:', error));

// Arrancar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});


/*
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');//Para los registros de los usuarios.
const authRoutes = require('./routes/authRoutes');//Para la autorización de los usuario.
const { Sequelize } = require('sequelize');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;



app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Inicialización de la base de datos
const sequelize = new Sequelize(process.env.DB_URI);

sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.log('No se pudo conectar a la base de datos:', error));

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
*/