/*
authroutes.js --> Rutas de autenticación para usuarios
- POST /api/auth/register --> Registra un nuevo usuario.
- POST /api/auth/login --> Inicia sesión y devuelve un token JWT.

Estas dos rutas usan las funciones definidas en authcontroller.js
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
