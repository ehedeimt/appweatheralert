const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ msg: 'No se proporcionó un token de autenticación' });
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ msg: 'Token no válido o ausente' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId; // Guardamos el ID del usuario en la request
    next(); // Pasamos al siguiente middleware o controlador
  } catch (error) {
    return res.status(403).json({ msg: 'Token inválido o expirado', error: error.message });
  }
}

module.exports = verifyToken;
