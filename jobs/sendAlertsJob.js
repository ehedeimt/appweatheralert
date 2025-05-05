const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

// 🕐 Pausa entre envíos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_INTENTOS = 5; // Número máximo de intentos por alerta

// Programa cada 5 minutos (en producción cambia a: '0 8 * * *')
cron.schedule('*/2 * * * *', async () => {
  console.log('⏰ Ejecutando envío de alertas para todos los usuarios...');

  try {
    const alertas = await Alerta.findAll();

    for (const alerta of alertas) {
      const usuario = await User.findByPk(alerta.usuario_id);

      if (!usuario || !usuario.email) {
        console.warn(`⚠️ No se encontró email para el usuario ID ${alerta.usuario_id}`);
        continue;
      }

      let intento = 0;
      let exito = false;

      while (intento < MAX_INTENTOS && !exito) {
        intento++;

        try {
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

            asunto = '🌊 Estado marítimo y fenómenos costeros';
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
                <tbody>${filas}</tbody>
              </table>
              <p style="margin-top: 20px;">¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información enviada se ha obtenido directamente desde la AEMET.</i></p>
            `;
          } else {
            // 🌡️ ALERTA DE TEMPERATURAS
            const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);
            const prediccion = respuesta.data[0]?.prediccion?.dia?.[0];
            const tempMax = prediccion?.temperatura?.maxima || '-';
            const tempMin = prediccion?.temperatura?.minima || '-';

            asunto = '🌤️ Temperaturas máximas y mínimas';
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
              <p style="margin-top: 20px;">¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información enviada se ha obtenido directamente desde la AEMET.</i></p>
            `;
          }

          await enviarCorreo(usuario.email, asunto, contenidoHTML);
          console.log(`✅ Correo enviado a ${usuario.email} para la alerta "${alerta.titulo}".`);
          exito = true;

        } catch (errorInterno) {
          console.warn(`⚠️ Intento ${intento} fallido para ${alerta.titulo}:`, errorInterno.message);

          if (intento < MAX_INTENTOS) {
            await delay(2000); // pausa entre reintentos
          }
        }
      }

      if (!exito) {
        try {
          await enviarCorreo(
            usuario.email,
            `⚠️ No se pudo procesar tu alerta "${alerta.titulo}"`,
            `
            <p>Hola ${usuario.name},</p>
            <p>No hemos podido obtener la información meteorológica para tu alerta en <b>${alerta.titulo}</b> después de ${MAX_INTENTOS} intentos.</p>
            <p>Se volverá a intentar en el próximo envío programado.</p>
            <p>Gracias por tu comprensión,<br>— El equipo de Weather Alert</p>
            `
          );
          console.log(`📬 Correo de error enviado a ${usuario.email} por la alerta "${alerta.titulo}".`);
        } catch (correoError) {
          console.error(`❌ También falló el correo de error para ${usuario.email}:`, correoError.message);
        }
      }

      await delay(1000); // pausa entre alertas
    }
  } catch (error) {
    console.error('❌ Error general en job de envío de alertas:', error.message);
  }
});
