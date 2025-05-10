const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_INTENTOS = 5;

const cierreHTML = `
  <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />
  <p style="font-size: 14px; line-height: 1.6; color: #444; font-family: Arial, sans-serif;">
    Gracias por usar <strong>Weather Alert</strong>.<br>
    <em>Esta información ha sido obtenida automáticamente desde los datos oficiales de la AEMET en el momento del envío.</em>
  </p>`;

cron.schedule('*/5 * * * *', async () => {
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
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/costas/${alerta.municipio_id}`);
            const zonas = res.data;

            const filas = zonas.map(z => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${z.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${z.estado}</td>
              </tr>`).join('');

            asunto = '🌊 Estado marítimo y fenómenos costeros';
            contenidoHTML = `
              <p style="font-size: 14px; font-family: Arial, sans-serif;">¡Hola ${usuario.name}!</p>
              <p style="font-size: 14px; font-family: Arial, sans-serif;">Esta es la situación marítima y de fenómenos costeros para: <b>${alerta.titulo}</b></p>
              <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: Arial, sans-serif; font-size: 14px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Subzona</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Estado</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>
              ${cierreHTML}`;

          } else if (alerta.descripcion?.toLowerCase().includes('playa')) {
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/playa/${alerta.municipio_id}`);
            const hoy = res.data?.[0]?.prediccion?.dia?.[0];

            asunto = '🏖️ Condiciones actuales en tu playa';
            contenidoHTML = `
              <p style="font-size: 14px; font-family: Arial, sans-serif;">¡Hola ${usuario.name}!</p>
              <p style="font-size: 14px; font-family: Arial, sans-serif;">Esta es la predicción de condiciones actuales para <b>${alerta.titulo}</b>:</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: Arial, sans-serif; font-size: 14px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Parámetro</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">Estado del cielo</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.estadoCielo?.descripcion1 || '-'}</td></tr>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">UV Máximo</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.uvMax?.valor1 || '-'}</td></tr>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">Temperatura del agua</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.tAgua?.valor1 || '-'} ºC</td></tr>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">Oleaje</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.oleaje?.descripcion1 || '-'}</td></tr>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">Viento</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.viento?.descripcion1 || '-'}</td></tr>
                  <tr><td style="padding: 10px; border: 1px solid #ddd;">Sensación térmica</td><td style="padding: 10px; border: 1px solid #ddd;">${hoy?.sTermica?.descripcion1 || hoy?.stermica?.descripcion1 || '-'}</td></tr>
                </tbody>
              </table>
              ${cierreHTML}`;
          }

        } catch (err) {
          console.warn(`⚠️ Intento ${intento} fallido para ${alerta.titulo}:`, err.message);
          if (intento < MAX_INTENTOS) await delay(2000);
        }
      }

      if (!exito) {
        try {
          await enviarCorreo(usuario.email, `⚠️ No se pudo procesar tu alerta "${alerta.titulo}"`, `
            <p style="font-size: 14px; font-family: Arial, sans-serif;">Hola ${usuario.name},</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif;">No hemos podido obtener la información meteorológica para tu alerta en <b>${alerta.titulo}</b> tras ${MAX_INTENTOS} intentos.</p>
            <p style="font-size: 14px; font-family: Arial, sans-serif;">Se volverá a intentar en el próximo envío automático.</p>
            ${cierreHTML}
          `);
          console.log(`📬 Correo de error enviado a ${usuario.email}`);
        } catch (correoError) {
          console.error(`❌ También falló el correo de error para ${usuario.email}:`, correoError.message);
        }
      }

      await delay(1000);
    }

  } catch (error) {
    console.error('❌ Error general en job de envío de alertas:', error.message);
  }
});
