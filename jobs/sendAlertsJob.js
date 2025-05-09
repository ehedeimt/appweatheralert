const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

// 🕐 Pausa entre envíos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_INTENTOS = 5;

// Programa cada 5 minutos
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
            // 🌊 COSTAS
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
              <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th>Subzona</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momento del envío de este correo.</i></p>`;
          
          } else if (alerta.descripcion?.toLowerCase().includes('playa')) {
            // 🏖️ PLAYA
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/playa/${alerta.municipio_id}`);
            const hoy = res.data?.[0]?.prediccion?.dia?.[0];

            asunto = '🏖️ Condiciones actuales en tu playa';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Predicción para <b>${alerta.titulo}</b>:</p>
              <ul>
                <li><b>Estado del cielo:</b> ${hoy?.estadoCielo?.descripcion1 || '-'}</li>
                <li><b>UV Máximo:</b> ${hoy?.uvMax?.valor1 || '-'}</li>
                <li><b>Temp. Agua:</b> ${hoy?.tAgua?.valor1 || '-'} ºC</li>
                <li><b>Oleaje:</b> ${hoy?.oleaje?.descripcion1 || '-'}</li>
                <li><b>Viento:</b> ${hoy?.viento?.descripcion1 || '-'}</li>
                <li><b>Sensación térmica:</b> ${hoy?.sTermica?.descripcion1 || hoy?.stermica?.descripcion1 || '-'}</li>
              </ul>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momento del envío de este correo.</i></p>`;
          
          } else if (alerta.descripcion?.toLowerCase().includes('montaña')) {
            // 🏔️ MONTAÑA
            const area = alerta.municipio_id;
            const dia = 0; // Por ahora fijo
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/montana/${area}/${dia}`);
            const datos = res.data?.[0]?.seccion || [];

            const partes = datos.flatMap(seccion =>
              seccion.apartado?.map(a =>
                `<li><strong>${a.cabecera}:</strong> ${a.texto}</li>`
              ) || []
            ).join('');

            const lugares = datos.find(s => s.nombre === 'sensacion_termica')?.lugar || [];
            const tablaLugares = lugares.map(l => `
              <tr>
                <td>${l.nombre}</td>
                <td>${l.altitud}</td>
                <td>${l.minima} / ${l.maxima}</td>
                <td>${l.stminima} / ${l.stmaxima}</td>
              </tr>`).join('');

            asunto = '🏔️ Predicción de montaña';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Resumen para <b>${alerta.titulo}</b>:</p>
              <ul>${partes}</ul>
              <h4>Puntos representativos:</h4>
              <table style="border-collapse: collapse; width: 100%;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th>Lugar</th><th>Altitud</th><th>T. mín/máx</th><th>Sens. térmica</th>
                  </tr>
                </thead>
                <tbody>${tablaLugares}</tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momento del envío de este correo.</i></p>`;
          
          } else {
            // 🌡️ TEMPERATURA
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);
            const pred = res.data?.[0]?.prediccion?.dia?.[0];

            asunto = '🌤️ Temperaturas máximas y mínimas';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Predicción para <b>${alerta.titulo}</b>:</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th>Ciudad</th><th>Temp. Máxima</th><th>Temp. Mínima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${alerta.titulo}</td>
                    <td>${pred?.temperatura?.maxima || '-'}</td>
                    <td>${pred?.temperatura?.minima || '-'}</td>
                  </tr>
                </tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momento del envío de este correo.</i></p>`;
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
            <p>Gracias por tu comprensión,<br>Weather Alert</p>
          `);
          console.log(`📬 Correo de error enviado a ${usuario.email}`);
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
