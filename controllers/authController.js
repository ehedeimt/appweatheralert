/*
authControler.js --> Autenticación del backend en Node.js permite el registro de usuarios, 
login con el token generado y hasheaar la contraseña para permitir el login.
*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config(); //acceso a process.env.JWT_SECRET

const SECRET_KEY = process.env.JWT_SECRET;

// 🔐 Registro de usuario
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const register = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ where: { email } });
  
      if (existingUser) {
        return res.status(400).json({ msg: 'El correo ya está registrado' });
      }
  
      // NO hasheamos aquí, lo hace el modelo en beforeCreate
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
      console.error('❌ Error al registrar usuario:', error);
      res.status(500).json({ msg: 'Error interno al registrar', error: error.message });
    }
  };
  
};

// 🔐 Login
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
      console.error('❌ SECRET_KEY no definida. Verifica tu .env');
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
    console.error('❌ Error interno en login:', error);
    res.status(500).json({ msg: 'Error interno al iniciar sesión', error: error.message });
  }
};

module.exports = { register, login };