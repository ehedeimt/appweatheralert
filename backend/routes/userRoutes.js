const express = require('express');
const User = require('../models/user');

const router = express.Router();

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await User.create({ name, email, password });
    res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', details: error });
  }
});

module.exports = router;