/*
authControler.js --> Autenticación del backend en Node.js permite el registro de usuarios, 
login con el token generado y hasheaar la contraseña para permitir el login.
Registro:
- Registra nuevo usuario si el email no está ya registrado.
- Crea usuario con la contraseña Hasheada en el modelo.
- Devuelve los datos básicos sin la contraseña.

Login:
- Valida existencia del correo.
- Compara la contraseña usando BCRYPT.
- Genera token JWT válido durante una hora.
- Devuelve el token y los datos del usuario.

Para que funcione:
- en fichero .env debe estar la variable de entorno.
*/
const bcrypt = require('bcrypt');//Compara contraseñas encriptadas.
const jwt = require('jsonwebtoken');//Genera los token JWT.
const User = require('../models/user');//Modelo de base de datos para usuarios.
require('dotenv').config(); //acceso a process.env.JWT_SECRET

const SECRET_KEY = process.env.JWT_SECRET;

/*
REGISTRO DE USUARIO
- Verifica que el correo existe en la BBDD.
- Si no existe, crea el usuario.
- Devuelve en formato JSON los datos del usuario sin la contraseña.
- Aviso de errores y confirmación de ejecución correctamente.
*/
const register = async (req, res) => {
  const { name, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ where: { email } });
  
      if (existingUser) {
        return res.status(400).json({ msg: 'El correo ya está registrado' });
      }
  
      const newUser = await User.create({ name, email, password });
  
      res.status(201).json({
        message: 'Usuario registrado correctamente',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ msg: 'Error interno al registrar', error: error.message });
    }
  };

/*
LOGIN DE USUARIO
- Busca el usuario por email.
- Compara las contraseñas. La almacenada con la ingresada ya hasheada.
- Si es válida genera un token por una hora.
- Devuelve el token y los datos del usuario.
- Avisos de errores y confirmaciones.*/
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    if (!SECRET_KEY) {
      console.error('SECRET_KEY no definida. Verifica tu .env');
      return res.status(500).json({ msg: 'Error de configuración del servidor (JWT_SECRET)' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error interno en login:', error);
    res.status(500).json({ msg: 'Error interno al iniciar sesión', error: error.message });
  }
};
module.exports = { register, login };