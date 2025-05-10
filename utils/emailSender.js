/*
emailSender.js
Para envíos de correos usando Nodemailer y Gmail.
- Crea un transportador autenticado con Gmail.
- Define una función enviarCorreo para enviar mensajes HTML.
- Informe de Errores.

Requiere las siguientes variables de entorno en el fichero .env:
- EMAIL_USER: dirección de correo remitente.
- EMAIL_PASS: contraseña o token de acceso. Clave de aplicación que hay que configurar en la cuenta de Gmail.
*/

//Importa el paquete de nodemailer para el envío de correos desde Node.js.
const nodemailer = require('nodemailer');

//Creo el objeto que se conectará a GMAIL pasando las credenciales de EMAIL_USER y EMAIL_PASS guardadas en el fichero .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//FUNCIÓN PARA EL ENVÍO DE CORREOS.
async function enviarCorreo(destinatario, asunto, mensajeHtml) { //obtiene el destinatario, el asunto y el mensajehtml que se va a enviar
  try {
    //Se envía el email con transporter con los valores anteriores.
    await transporter.sendMail({
      from: `"Weather Alert" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: mensajeHtml
    });
    console.log(`********* Email enviado a ${destinatario}`); //Deja el registro en consola que se ha enviado el correo al usuario.
  } catch (error) {
    console.error('+++++++++ Error enviando email:', error.message); //En caso de error también lo registro en el log para que se pueda consultar tras los envíos programados.
  }
}
//Permite el acceso a la función enviarCorreo desde afuera, por ejemplo el fichero sendAlertsJob.js
module.exports = { enviarCorreo };