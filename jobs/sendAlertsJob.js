const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

// Programa cada 10 minutos
//cron.schedule('0 8 * * *', async () => { configuración final de todos los días a las 8 de la mañana.
cron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Ejecutando envío de alertas para todos los usuarios...');

  try {
    const alertas = await Alerta.findAll();

    for (const alerta of alertas) {
      try {
        const usuario = await User.findByPk(alerta.usuario_id);

        if (!usuario || !usuario.email) {
          console.warn(`⚠️ No se encontró email para el usuario ID ${alerta.usuario_id}`);
          continue;
        }

        let asunto = '';
        let contenidoHTML = '';

        if (alerta.descripcion?.toLowerCase().includes('marítimo')) {
          // 🌊 ALERTA DE COSTAS
          const respuestaCostas = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/costas/${alerta.municipio_id}`);
          const zonas = respuestaCostas.data;

          const filas = zonas.map(z =>
            `<tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${z.nombre}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${z.estado}</td>
            </tr>`
          ).join('');

          asunto = '🌊 Estado marítimo - Weather Alert';
          contenidoHTML = `
            <p>¡Hola ${usuario.name}!</p>
            <p>Esta es la situación marítima para tu zona seleccionada: <b>${alerta.titulo}</b></p>

            <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-top: 10px;">
              <thead>
                <tr style="background-color: #F26E22; color: white;">
                  <th style="padding: 8px; border: 1px solid #ddd;">Subzona</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${filas}
              </tbody>
            </table>

            <p style="margin-top: 20px;">⚓ Información oficial de AEMET.<br>¡Cuídate!<br>— Equipo de Weather Alert</p>
          `;
        } else {
          // 🌡️ ALERTA DE TEMPERATURAS
          const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);

          console.log(`📩 Predicción recibida para ${alerta.titulo}:`);
          console.log(JSON.stringify(respuesta.data, null, 2));

          const prediccion = respuesta.data[0]?.prediccion?.dia?.[0];
          const tempMax = prediccion?.temperatura?.maxima || '-';
          const tempMin = prediccion?.temperatura?.minima || '-';

          asunto = '🌤️ Predicción meteorológica - Weather Alert';
          contenidoHTML = `
            <p>¡Hola ${usuario.name}!</p>
            <p>Esta es la predicción actual para <b>${alerta.titulo}</b>:</p>

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

            <p style="margin-top: 20px;">☀️ ¡Que tengas un buen día!<br>— Equipo de Weather Alert</p>
          `;
        }

        await enviarCorreo(usuario.email, asunto, contenidoHTML);
        console.log(`✅ Correo enviado a ${usuario.email} para la alerta "${alerta.titulo}".`);

      } catch (errorInterno) {
        console.error('⚡ Error interno procesando alerta:', errorInterno.message);
      }
    }
  } catch (error) {
    console.error('❌ Error general en job de envío de alertas:', error.message);
  }
});
