/*
Middleware de autenticación con JWT. Asegura que solo lo usuarios autenticados pueden acceder a las rutas.
- Verifica que el request tenga un token válido en la cabecera Authorization.
- Si el token es válido, añade el userId a `req.userId` y sigue.
- Si es inválido o ausente, devuelve error 401 o 403.

Necesita para que funcione:
- Variable de entorno JWT_SECRET. en .env
- Token con formato: "Bearer TOKEN".
 */

//CONFIGURACIONES
const jwt = require('jsonwebtoken'); //Importo jsonwebtoken para poder verificar el token.
require('dotenv').config();//Cargo las variables de entorno para acceder a JWT_SECRET.
const SECRET_KEY = process.env.JWT_SECRET;//Se guarda la clave secreta en la constante SECRET_KEY.

//FUNCIÓN PARA VERIFICAR QUE EL TOKEN ESTÁ PRESENTE Y ES VÁLIDO.
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ msg: 'No se proporcionó un token de autenticación' }); //Mensaje si no se detecta.
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ msg: 'Token no válido o ausente' });//Mensje si el token no está bien formado.
  }

  try {
    //Uso jwt.verify para validar el token con la clave secreta
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId; //Guarda el ID del usuario en la request
    next(); //Pasamos al siguiente middleware o controlador
  //Si el token a expirado se inddica con el siguiente mensaje.  
  } catch (error) {
    return res.status(403).json({ msg: 'Token inválido o expirado', error: error.message });
  }
}
//Lo hago accesible.
module.exports = verifyToken;
