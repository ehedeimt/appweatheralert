const express = require('express');
const router = express.Router();
const { obtenerAlertas } = require('../services/aemetService');

router.get('/alertas-actuales', async (req, res) => {
  try {
    const alertasAemet = await obtenerAlertas();
    const filtradas = alertasAemet
      .filter(a => a.titulo && a.descripcion)
      .map(a => ({ titulo: a.titulo, descripcion: a.descripcion }));

    res.json(filtradas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener alertas', error: error.message });
  }
});

module.exports = router;