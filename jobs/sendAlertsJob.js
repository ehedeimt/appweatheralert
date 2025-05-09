const cron = require('node-cron');
const axios = require('axios');
const { enviarCorreo } = require('../utils/emailSender');
const Alerta = require('../models/alerta');
const User = require('../models/user');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_INTENTOS = 5;

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
            const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/costas/${alerta.municipio_id}`);
            const zonas = respuesta.data;

            const filas = zonas.map(z =>
              `<tr><td style="padding:8px;border:1px solid #ddd;">${z.nombre}</td><td style="padding:8px;border:1px solid #ddd;">${z.estado}</td></tr>`
            ).join('');

            asunto = '🌊 Estado marítimo y fenómenos costeros';
            contenidoHTML = `
              <p>¡Hola ${usuario.name}!</p>
              <p>Situación marítima para <b>${alerta.titulo}</b>:</p>
              <table style="border-collapse: collapse; width:100%; max-width:600px;">
                <thead><tr style="background:#F26E22;color:white;">
                  <th style="padding:8px;border:1px solid #ddd;">Subzona</th>
                  <th style="padding:8px;border:1px solid #ddd;">Estado</th>
                </tr></thead>
                <tbody>${filas}</tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momemnto del envío de este correo.</i></p>`;
          
          } else if (alerta.descripcion?.toLowerCase().includes('playa')) {
            // 🏖️ PLAYAS
            const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/playa/${alerta.municipio_id}`);
            const dia = respuesta.data?.[0]?.prediccion?.dia?.[0];

            const fecha = dia?.fecha?.toString();
            const formateada = fecha?.length === 8 ? `${fecha.slice(6,8)}/${fecha.slice(4,6)}/${fecha.slice(0,4)}` : '-';

            const cielo = dia?.estadoCielo?.descripcion1 || '-';
            const viento = dia?.viento?.descripcion1 || '-';
            const oleaje = dia?.oleaje?.descripcion1 || '-';
            const termica = dia?.sTermica?.descripcion1 || dia?.stermica?.descripcion1 || '-';
            const tAgua = dia?.tAgua?.valor1 || '-';
            const uv = dia?.uvMax?.valor1 || '-';

            asunto = '🏖️ Condiciones en playa';
            contenidoHTML = `
              <p>Hola ${usuario.name},</p>
              <p>Predicción para la playa <b>${alerta.titulo}</b> el día <b>${formateada}</b>:</p>
              <table style="border-collapse: collapse; width:100%; max-width:500px;">
                <thead>
                  <tr style="background:#F26E22; color:white;">
                    <th style="padding:8px;border:1px solid #ddd;">Cielo</th>
                    <th style="padding:8px;border:1px solid #ddd;">Viento</th>
                    <th style="padding:8px;border:1px solid #ddd;">Oleaje</th>
                    <th style="padding:8px;border:1px solid #ddd;">Sensación</th>
                    <th style="padding:8px;border:1px solid #ddd;">Temp. agua</th>
                    <th style="padding:8px;border:1px solid #ddd;">Índice UV</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd;">${cielo}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${viento}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${oleaje}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${termica}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${tAgua} ºC</td>
                    <td style="padding:8px;border:1px solid #ddd;">${uv}</td>
                  </tr>
                </tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momemnto del envío de este correo.</i></p>`;
          
          } else {
            // 🌡️ TEMPERATURAS
            const respuesta = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);
            const prediccion = respuesta.data[0]?.prediccion?.dia?.[0];
            const tempMax = prediccion?.temperatura?.maxima || '-';
            const tempMin = prediccion?.temperatura?.minima || '-';

            asunto = '🌤️ Temperaturas máximas y mínimas';
            contenidoHTML = `
              <p>Hola ${usuario.name},</p>
              <p>Predicción para <b>${alerta.titulo}</b>:</p>
              <table style="border-collapse: collapse; width:100%; max-width:400px;">
                <thead>
                  <tr style="background:#F26E22; color:white;">
                    <th style="padding:8px;border:1px solid #ddd;">Ciudad</th>
                    <th style="padding:8px;border:1px solid #ddd;">Máxima</th>
                    <th style="padding:8px;border:1px solid #ddd;">Mínima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:8px;border:1px solid #ddd;">${alerta.titulo}</td>
                    <td style="padding:8px;border:1px solid #ddd;">${tempMax} ºC</td>
                    <td style="padding:8px;border:1px solid #ddd;">${tempMin} ºC</td>
                  </tr>
                </tbody>
              </table>
              <p style="margin-top:20px;">Gracias por usar nuestro servicio de alertas. <br>¡Un saludo!<br>El Equipo de Weather Alert.<br><i>La información mostrada en esta alerta ha sido obtenida mediante consultas a la AEMET en el momemnto del envío de este correo.</i></p>`;
          }

          await enviarCorreo(usuario.email, asunto, contenidoHTML);
          console.log(`✅ Correo enviado a ${usuario.email} para "${alerta.titulo}"`);
          exito = true;

        } catch (errorInterno) {
          console.warn(`⚠️ Intento ${intento} fallido para ${alerta.titulo}: ${errorInterno.message}`);
          if (intento < MAX_INTENTOS) await delay(2000);
        }
      }

      if (!exito) {
        try {
          await enviarCorreo(
            usuario.email,
            `⚠️ Error al procesar tu alerta "${alerta.titulo}"`,
            `<p>No se pudo obtener información tras ${MAX_INTENTOS} intentos.<br>Volveremos a intentarlo en el próximo envío.</p>`
          );
          console.log(`📩 Correo de error enviado a ${usuario.email}`);
        } catch (correoError) {
          console.error(`❌ Falló el correo de error para ${usuario.email}: ${correoError.message}`);
        }
      }

      await delay(1000);
    }
  } catch (error) {
    console.error('❌ Error general en job de envío:', error.message);
  }
});
