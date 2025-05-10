/*
Modelo Sequelize para usuarios.
Campos:
- name: Nombre completo del usuario.
- email: Correo electrónico único.
- password: Contraseña (se almacena encriptada)

Seguridad:
- Antes de crear un usuario, se hashea la contraseña con bcrypt.

Requiere:
- Variable de entorno DB_URI (PostgreSQL)
 */

//CONFIGURACIÓN E IMPORTACIONES.
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');//Para la encriptación o hasheo de la contraseña.
const sequelize = new Sequelize(process.env.DB_URI, {//crea instancia de conexión con la BBDD creada en postgreSQL
  dialect: 'postgres',
});

//DEFINICIÓN DE CAMPOS DE LA TABLA User.
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

//Hashear la contraseña antes de guardar el usuario.
User.beforeCreate(async (user, options) => {
  if (user.password) {
    const hashedPassword = await bcrypt.hash(user.password, 10); //Hashea la contraseña antes de guardarla
    user.password = hashedPassword; // Asigna la contraseña hasheada al campo password
  }
});
//exporto para que pueda ser usado. por controladores externos como authController.js
module.exports = User;