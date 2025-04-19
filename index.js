const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const { Sequelize } = require('sequelize');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Inicialización de la base de datos
const sequelize = new Sequelize(process.env.DB_URI);

sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.log('No se pudo conectar a la base de datos:', error));

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});