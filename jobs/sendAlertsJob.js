const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

// Programa cada 25 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('Ejecutando envío de alertas para todos los usuarios...');

  try {
    const alertas = await Alerta.findAll();

    for (const alerta of alertas) {
      try {
        // Obtener predicción meteorológica desde tu API
        const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.titulo}`);

        //Veo en Railway si se está obteniendo información de la AEMET
        console.log(`Predicción recibida para ${alerta.titulo}:`);
        console.log(JSON.stringify(respuesta.data, null, 2));


        let prediccion = null;
        let tempMax = '-';
        let tempMin = '-';

        if (Array.isArray(respuesta.data) && respuesta.data[0]?.prediccion?.dia?.[0]) {
          prediccion = respuesta.data[0].prediccion.dia[0];

          if (prediccion.temperatura) {
            tempMax = prediccion.temperatura.maxima || '-';
            tempMin = prediccion.temperatura.minima || '-';
          }
        } else {
          console.warn(`No se pudo obtener predicción válida para ${alerta.titulo}`);
        }

        // Buscar usuario
        const usuario = await User.findByPk(alerta.usuario_id);

        if (usuario && usuario.email) {
          await enviarCorreo(
            usuario.email,
            'Predicción Meteorológica de Weather Alert',
            `
            <p>¡Hola ${usuario.name}!</p>
            <p>Esta es la predicción actual para tu alerta configurada en <b>${alerta.titulo}</b>:</p>

            <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin-top: 10px;">
              <thead>
                <tr style="background-color: #F26E22; color: white;">
                  <th style="padding: 8px; border: 1px solid #ddd;">Ciudad</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Temp. Máxima</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Temp. Mínima</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${alerta.titulo}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tempMax} ºC</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${tempMin} ºC</td>
                </tr>
              </tbody>
            </table>

            <p style="margin-top: 20px;">¡Que tengas un buen día! ☀️<br>— Equipo de Weather Alert</p>
            `
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
