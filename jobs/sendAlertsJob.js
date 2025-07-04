/*
sendAlertJob.js
Script para la gestión de los envíos de correos electrónicos de las alertas que configuren los usuarios usando node-cron
*/ 

/*IMPORTACIONES Y CONFIGURACIONES*/
const cron = require('node-cron');//cron job
const axios = require('axios');//para hacer llamadas http a la API.
const { enviarCorreo } = require('../utils/emailSender');//función para enviar correos que se encuentra en utils/emailSender.js
const Alerta = require('../models/alerta');//Modelo de BBDD de alerta.
const User = require('../models/user');//Modelo de BBDD de user.

//FUNCIÓN PARA APLICAR UN DELAY ENTRE REINTENTOS O ENVIOS
//En algunos momentos ha fallado y parece que al poner espacios entre cada intento hay más posibilidad que la consulta a la API de resulados buenos.
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Numero máximo de intentos antes de enviar el correo informando al usuario que no ha sido posible obtener la información de la AEMET.
const MAX_INTENTOS = 5;

//Al poner la misma "Firma" lo creo como constante que insertaré luego en cada correo personalizado.
const cierreHTML = `
  <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />
  <p style="font-size: 14px; line-height: 1.6; color: #444; font-family: Arial, sans-serif;">
    Gracias por usar <strong>Weather Alert</strong>.<br>
    <em>Esta información ha sido obtenida automáticamente desde los datos oficiales de la AEMET en el momento del envío.</em>
  </p>`;

//PROGRAMACIÓN DE LOS ENVÍOS DE CORREOS.
//PARA TESTING EL ENVÍO LO HAGO CADA 5 MINUTOS: cron.schedule('*/5 * * * *', async () => { 
//PARA PRODUCCIÓN EL ENVÍO LO PROGRAMO TODOS LOS DÍAS A LAS 8:00:  cron.schedule('0 8 * * *', async () => {    
cron.schedule('0 8 * * *', async () => {
  console.log('======> EMPIEZA EL ENVÍO: Ejecutando envío de alertas para todos los usuarios <======');

  //Busco todas las alertas.
  try {
    const alertas = await Alerta.findAll();

    //Se procesa alerta por alerta obteniendo el usuario.
    for (const alerta of alertas) {
      const usuario = await User.findByPk(alerta.usuario_id);
      if (!usuario || !usuario.email) {
        console.warn(`No se encontró email para el usuario ID ${alerta.usuario_id}`);
        continue;
      }

      //Intento enviar hasta 5 veces o el valor de la const MAX_INTENTOS, esperando 2 segundos entre intentos si fallan
      let intento = 0;
      let exito = false;

      while (intento < MAX_INTENTOS && !exito) {
        intento++;

        try {
          let asunto = '';
          let contenidoHTML = '';
          //Obtención de la información en la llamada a la AEMET y formateo del correo que se va a enviar.
          if (alerta.descripcion?.toLowerCase().includes('marítimo')) {//Si la alerta incluye marítimo envía este formato.
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/costas/${alerta.municipio_id}`);
            const zonas = res.data;

            const filas = zonas.map(z => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${z.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${z.estado}</td>
              </tr>`).join('');

            asunto = '🌊 Estado marítimo y fenómenos costeros'; //Asunto del correo enviado. El icono lo pongo desde el mismo visual studio pulsando la tecla fn
            contenidoHTML = `
              <p style="font-family: Arial, sans-serif; font-size: 14px;">¡Hola ${usuario.name}!</p>
              <p style="font-family: Arial, sans-serif; font-size: 14px;">Esta es la situación marítima y de fenómenos costeros para: <b>${alerta.titulo}</b></p>
              <table style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: Arial, sans-serif; font-size: 14px;">
                <thead>
                  <tr style="background-color: #F26E22; color: white;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Subzona</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Estado</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>
              ${cierreHTML}`; //La constante creada para la firma de los correos.

          //SI LA DESCRIPCIÓN DE LA ALERTA INCLUYE PLAYA ENTRARÁ EN ESTA CONDICIÓN.    
          } else if (alerta.descripcion?.toLowerCase().includes('playa')) {
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/playa/${alerta.municipio_id}`);
            const hoy = res.data?.[0]?.prediccion?.dia?.[0];

            //ASUNTO Y FORMATEO DEL CORREO.
            asunto = '🏖️ Condiciones actuales en tu playa';
            contenidoHTML = `
              <p style="font-family: Arial, sans-serif; font-size: 14px;">¡Hola ${usuario.name}!</p>
              <p style="font-family: Arial, sans-serif; font-size: 14px;">Esta es la predicción de condiciones actuales para <b>${alerta.titulo}</b>:</p>
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
              ${cierreHTML}`;//Misma Firma en todos los correos.
          
          //SI LA ALERTA INCLUYE MONTAÑA ENTRARÁ POR ESTA CONDICIÓN    
          } else if (alerta.descripcion?.toLowerCase().includes('montaña')) {
            //Configuración necesaria para esta llamada y recopilación de los datos.
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
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${l.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${l.altitud}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${l.minima} / ${l.maxima}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 14px;">${l.stminima} / ${l.stmaxima}</td>
              </tr>`).join('');

            //FORMATO DEL CORREO PARA LA ALERTA DE MONTAÑA.  
            asunto = '🏔️ Predicción de montaña';
            contenidoHTML = `
              <p style="font-family: Arial, sans-serif; font-size: 14px;">¡Hola ${usuario.name}!</p>
              <p style="font-family: Arial, sans-serif; font-size: 14px;">Resumen de predicción de montaña en <b>${alerta.titulo}</b>:</p>
              <ul style="font-family: Arial, sans-serif; font-size: 14px;">${partes}</ul>
              <h4 style="font-family: Arial, sans-serif; font-size: 14px;">Puntos representativos:</h4>
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
              ${cierreHTML}`;//Firma común a todos los envíos.
          
          //SI NO SE CUMPLE NINGUNA DE LAS TRES CONDICIONES ANTERIORES, ENTRARÁ POR ESTA CONDICIÓN Y SE LE APLICA EL SIGUIENTE FORMATO AL CORREO.    
          } else {
            const res = await axios.get(`https://appweatheralert-production.up.railway.app/api/aemet/prediccion/${alerta.municipio_id}`);
            const pred = res.data?.[0]?.prediccion?.dia?.[0];
            
            //FORMATO DEL CORREO.
            asunto = '🌤️ Temperaturas máximas y mínimas';
            contenidoHTML = `
              <p style="font-family: Arial, sans-serif; font-size: 14px;">¡Hola ${usuario.name}!</p>
              <p style="font-family: Arial, sans-serif; font-size: 14px;">Esta es la predicción de temperaturas para <b>${alerta.titulo}</b>:</p>
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
              ${cierreHTML}`; //Firma Común a todos los correos.
          }
          
          //ENVÍO DEL CORREO CON EXITO, SE REGISTRA EN CONSOLA EL MENSAJE.
          await enviarCorreo(usuario.email, asunto, contenidoHTML);
          console.log(`==> ******* Correo enviado a ${usuario.email} para "${alerta.titulo}"`);//Mensaje en consola informando cada envío.
          exito = true;

        //SI FALLA EL ENVÍO  
        } catch (err) {
          console.warn(`==> OJO ESTÁN FALLANDO LOS ENVÍOS: Intento ${intento} fallido para ${alerta.titulo}:`, err.message); //Mensaje que se registrará en la consola.
          if (intento < MAX_INTENTOS) await delay(2000);//Compruebo si no se han superado el máximo de intentos configurados y aplico el delay antes de intentar otra vez.
        }
      }
      //SI SE AGOTAN TODOS LOS INTENTOS ENTRARÁ POR ESTA CONDICIÓN Y SE ENVIARÁ UN CORREO AL USUARIO INFORMANDO DEL ERROR.
      if (!exito) {
        try {
          //FORMATO DEL CORREO
          await enviarCorreo(usuario.email, `⚠️ No se pudo procesar tu alerta "${alerta.titulo}"`, `
            <p style="font-family: Arial, sans-serif; font-size: 14px;">Hola ${usuario.name},</p>
            <p style="font-family: Arial, sans-serif; font-size: 14px;">No hemos podido obtener la información meteorológica para tu alerta en <b>${alerta.titulo}</b> tras ${MAX_INTENTOS} intentos.</p>
            <p style="font-family: Arial, sans-serif; font-size: 14px;">Se volverá a intentar en el próximo envío automático.</p>
            ${cierreHTML}
          `);
          //REGISTRO EN CONSOLA QUE SE HA ENVIADO EL CORREO AL USUARIO CON EL ERROR.
          console.log(`==> Correo de error enviado a ${usuario.email}`);
        } catch (correoError) {
          console.error(`También falló el correo de error para ${usuario.email}:`, correoError.message);
        }
      }
      await delay(1000);
    }

    //MOSTRAR EN CONSOLA OTROS ERRORES QUE SE PUEDAN DAR.
  } catch (error) {
    console.error('Error general en job de envío de alertas:', error.message);
  }
});
