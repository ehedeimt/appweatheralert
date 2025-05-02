/*No Eliminar los comentarios*/

const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

// Programa cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('Ejecutando envío de alertas para todos los usuarios...');

  try {
    const alertas = await Alerta.findAll();

    for (const alerta of alertas) {
      try {
        // Consultar la predicción meteorológica (puedes mantener esto si quieres mostrar datos)
        const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.titulo}`);
        const prediccion = respuesta.data[0]?.prediccion?.dia[0];

        let lluvia = '-';
        let viento = '-';

        if (prediccion) {
          lluvia = prediccion.probPrecipitacion[0]?.value || '-';
          viento = prediccion.viento[0]?.velocidad || '-';
        }

        const usuario = await User.findByPk(alerta.usuario_id);

        if (usuario && usuario.email) {
          await enviarCorreo(
            usuario.email,
            '🌦️ Actualización Meteorológica de Weather Alert',
            `<p>¡Hola ${usuario.name}!</p>
             <p>Esta es una actualización para tu alerta configurada en <b>${alerta.titulo}</b>.</p>
             <p><strong>Predicción actual:</strong><br>
             - Lluvia: ${lluvia}%<br>
             - Viento: ${viento} km/h</p>
             <p>¡Gracias por confiar en Weather Alert! 🌈</p>`
          );
          console.log(`Correo enviado a ${usuario.email} para la alerta "${alerta.titulo}".`);
        } else {
          console.warn(`No se encontró email para el usuario ID ${alerta.usuario_id}`);
        }
      } catch (errorInterno) {
        console.error('⚡ Error interno procesando alerta:', errorInterno.message);
      }
    }
  } catch (error) {
    console.error('Error general en job de envío de alertas:', error.message);
  }
});
