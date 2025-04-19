const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres', // <-- Asegúrate de especificar esto
});

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = User;