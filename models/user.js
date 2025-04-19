const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
});

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
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hashea la contraseña antes de guardarla
    user.password = hashedPassword; // Asigna la contraseña hasheada al campo 'password'
  }
});

module.exports = User;