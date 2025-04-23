const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

// Modelo Sequelize de tus alertas
const Alerta = require('../models/alerta');

// Ruta protegida: obtener alertas del usuario autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      where: { usuario_id: req.userId }
    });

    res.json(alertas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener alertas', error: error.message });
  }
});

module.exports = router;
