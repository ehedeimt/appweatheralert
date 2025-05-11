# appweatheralert
 Back y Front para la aplicación Weather Alert

 # package.json
 Como los fichero .json no permiten comenarios se describen aquí las funcionalidades del mismo.
{
    "name": "backend", //Metadatos del proyecto. Nombre.
    "version": "1.0.0", //Metadatos del proyecto. Versión.
    "main": "index.js", //Metadatos del proyecto. Fichero de entrada del proyecto.
    "scripts": {
      "start": "node index.js" //Lanzado del backend.
    },
    "dependencies": { //DEPENDENCIAS NECESARIAS PARA QUE FUNCIONE EL PROYECTO.
      "express": "^4.17.1", //Para el uso de rutas y servidor web.
      "sequelize": "^6.0.0", //ORM para BBDD PostgreSQL.Genera las querys a la BBDD
      "pg": "^8.0.0", //Driver de PostgreSQL necesario para Sequelize.
      "bcrypt": "^5.1.0", //Hash de contraseñas.
      "jsonwebtoken": "^9.0.2", //Necesario para la creación y verificación de tokens JWT.
      "axios": "^1.4.0", //Cliente para llamadas a la AEMET.
      "nodemailer": "^6.9.8", //Necesario para el envío de correos.
      "node-cron": "^3.0.3", //Necesario para automatizar job de envío de correos.
      "dotenv": "^10.0.0" //Para cargar las variables de entorno.
    }
  }

