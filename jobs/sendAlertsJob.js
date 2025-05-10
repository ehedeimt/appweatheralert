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
  <p style="font-size: 14px; line-height: 1.6; color: #444;">
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
              <p>¡Hola ${usuario.name}!</p>
              <p>Esta es la situación marítima para: <b>${alerta.titulo}</b></p>
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
              <p>¡Hola ${usuario.name}!</p>
              <p>Predicción para <b>${alerta.titulo}</b>:</p>
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

          } else if (alerta.descripcion?.toLowerCase().includes('montaña')) {
            const area = alerta.municipio_id;
            const dia = alerta.dia_alerta_montana || 0;
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/montana/${area}/${dia}`);
            const datos = res.data?.[0]?.seccion || [];

            const partes = datos.flatMap(seccion =>
              seccion.apartado?.map(a => `<li><strong>${a.cabecera}:</strong> ${a.texto}</li>`) || []
            ).join('');

            const lugares = datos.find(s => s.nombre === 'sensacion_termica')?.lugar || [];
            const tablaLugares = lugares.map(l => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${l.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${l.altitud}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${l.minima} / ${l.maxima}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${l.stminima} / ${l.stmaxima}</td>
              </tr>`).join('');

            asunto = '🏔️ Predicción de montaña';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Resumen para <b>${alerta.titulo}</b>:</p>
              <ul style="font-family: Arial, sans-serif; font-size: 14px;">${partes}</ul>
              <h4>Puntos representativos:</h4>
              <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Lugar</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Altitud</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">T. mín/máx</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Sens. térmica</th>
                  </tr>
                </thead>
                <tbody>${tablaLugares}</tbody>
              </table>
              ${cierreHTML}`;

          } else {
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);
            const pred = res.data?.[0]?.prediccion?.dia?.[0];

            asunto = '🌤️ Temperaturas máximas y mínimas';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Predicción para <b>${alerta.titulo}</b>:</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 400px; font-family: Arial, sans-serif; font-size: 14px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Ciudad</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Temp. Máxima</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Temp. Mínima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${alerta.titulo}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${pred?.temperatura?.maxima || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${pred?.temperatura?.minima || '-'}</td>
                  </tr>
                </tbody>
              </table>
              ${cierreHTML}`;
          }

          await enviarCorreo(usuario.email, asunto, contenidoHTML);
          console.log(`✅ Correo enviado a ${usuario.email} para "${alerta.titulo}"`);
          exito = true;

        } catch (err) {
          console.warn(`⚠️ Intento ${intento} fallido para ${alerta.titulo}:`, err.message);
          if (intento < MAX_INTENTOS) await delay(2000);
        }
      }

      if (!exito) {
        try {
          await enviarCorreo(usuario.email, `⚠️ No se pudo procesar tu alerta "${alerta.titulo}"`, `
            <p>Hola ${usuario.name},</p>
            <p>No hemos podido obtener la información meteorológica para tu alerta en <b>${alerta.titulo}</b> tras ${MAX_INTENTOS} intentos.</p>
            <p>Se volverá a intentar en el próximo envío automático.</p>
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