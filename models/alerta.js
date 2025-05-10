/*
Modelo Sequelize para las alertas personalizadas creadas por los usuarios.

Campos:
- titulo: Nombre descriptivo de la alerta.
- descripcion: Tipo o categoría de alerta (temperatura, playa, montaña...)
- usuario_id: Referencia al usuario creador.
- fecha_creacion: Fecha de creación (se inserta automáticamente).
- municipio_id: Código de la zona geográfica asociada. Al añadir más alertas era necesario cambiar este nombre de columna ya que no siempre se guardan municipios.
- dia_alerta_montana: Día específico para alertas de montaña (obligatorio para esta alerta, pero no para el resto y quedará nulo).

Opciones:
- Tabla asociada: 'alertas'

Requiere:
- Variable de entorno DB_URI con la URI de conexión a la BBDD PostgreSQL.
*/


//IMPORTACIONES Y CONFIGURACIONES DE SQUELIZE
const { Sequelize, DataTypes } = require('sequelize');//importa el ORM Y los tipos de datos.
const sequelize = new Sequelize(process.env.DB_URI, {//crea instancia de conexión con la BBDD creada en postgreSQL
  dialect: 'postgres',
});

//DEFINICIÓN DE COLUMNAS EN TABLA alertas.
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
