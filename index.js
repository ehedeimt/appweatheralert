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

//CONFIGURACIÓN DE RUTAS
//const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');//
const alertasRoutes = require('./routes/alertasRoutes');
const aemetRoutes = require('./routes/aemetRoutes');

//CONFIGURACIÓN INICIAL DEL SERVIDOR.
dotenv.config();//Carga las variables.
const app = express();//Crea instancia Express
const port = process.env.PORT || 3000;//Defino el puerto de escucha 3000.

//MIDDLEWARES.
app.use(express.json());//Permite recibir datos en formato JSON en el body.
app.use(express.static(path.join(__dirname, 'frontend')));//Servir archivos estáticos desde frontend.

//MIDDLEWARE. Forzar la codificación de las respuestas evitando errores en tildes y caracteres.
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

//MONTAJE DE RUTAS API.
//app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);//Conecta con rutas para control de login y registro.
app.use('/api/alertas', alertasRoutes);//Contecta con ruta para el manejo de alertas.
app.use('/api/aemet', aemetRoutes); //Conecta con ruta para las distintas predicciones y por tanto llamadas a la AEMET.

//RUTA PARA EL FRONTEND. CUALQUIER RUTA QUE NO SEA DE LA API, redirige al frontend a la página de inicio index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

//CONEXIÓN A LA BBDD Y REGISTRO DE ERRORES EN CONSOLA.
const sequelize = new Sequelize(process.env.DB_URI);
sequelize.authenticate()
  .then(() => console.log('====>Conectado a la base de datos<===='))
  .catch(error => console.error('Error al conectar a la BBDD:', error));

//CARGA Y EJECUTA EL CRON PARA EL ENVÍO DE ALERTAS POR CORREO ELECTRÓNICO.
require('./jobs/sendAlertsJob');

//ARRANCA EL SERVIDOR Y SE MUESTRA EN CONSOLA EL MENSAJE DEFINIDO.
app.listen(port, () => {
  console.log(`======>Servidor corriendo en el puerto: ${port}`);
});
