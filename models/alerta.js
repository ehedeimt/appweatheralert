const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
});

const Alerta = sequelize.define('Alerta', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  municipio_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dia_alerta_montana: {
  type: DataTypes.INTEGER,
  allowNull: true
}
}, {
  tableName: 'alertas',
  timestamps: false
});

module.exports = Alerta;
