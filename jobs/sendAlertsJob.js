// jobs/sendAlertsJob.js
const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const { Alerta } = require('../models/alerta');
const { User } = require('../models/user'); // Asegúrate que tienes el modelo User bien hecho

cron.schedule('0 * * * *', async () => { // Cada hora exacta
  console.log('⏰ Comprobando alertas meteorológicas...');

  try {
    const alertas = await Alerta.findAll();

    for (const alerta of alertas) {
      try {
        // Consultar la predicción meteorológica por municipio
        const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.titulo}`);
        const prediccion = respuesta.data[0]?.prediccion?.dia[0];

        if (!prediccion) {
          console.warn(`⚠️ Predicción vacía para municipio ${alerta.titulo}`);
          continue;
        }

        const lluvia = prediccion.probPrecipitacion[0]?.value || 0;
        const viento = prediccion.viento[0]?.velocidad || 0;

        // Verificamos si se cumplen condiciones
        if (lluvia > 70 || viento > 50) {
          const usuario = await User.findByPk(alerta.usuario_id);

          if (usuario && usuario.email) {
            await enviarCorreo(
              usuario.email,
              '🌧️ Alerta Meteorológica de Weather Alert',
              `<p>¡Hola ${usuario.name}!</p>
               <p>Se detecta alta probabilidad de lluvia o viento fuerte en <b>${alerta.titulo}</b>.</p>
               <p><strong>Detalles:</strong><br>
               - Lluvia: ${lluvia}%<br>
               - Viento: ${viento} km/h</p>
               <p>¡Toma precauciones! ☂️</p>`
            );
          }
        }
      } catch (errorInterno) {
        console.error('⚡ Error interno procesando alerta:', errorInterno.message);
      }
    }
  } catch (error) {
    console.error('❌ Error general en job de envío de alertas:', error.message);
  }
});
