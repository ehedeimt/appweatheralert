// utils/emailSender.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // O el proveedor que uses
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo(destinatario, asunto, mensajeHtml) {
  try {
    await transporter.sendMail({
      from: `"Weather Alert" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: mensajeHtml
    });
    console.log(`✉️ Email enviado a ${destinatario}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
  }
}

module.exports = { enviarCorreo };