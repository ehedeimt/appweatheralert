const express = require('express');
const router = express.Router();
const axios = require('axios');
const { obtenerAlertas } = require('../services/aemetService');

// Rutas de alertas AEMET (mock o reales)
router.get('/alertas-actuales', async (req, res) => {
  try {
    const alertas = await obtenerAlertas();
    const filtradas = Array.isArray(alertas)
      ? alertas.filter(a => a.titulo && a.descripcion)
      : [];
    res.json(filtradas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener alertas', error: error.message });
  }
});

// Predicción por municipio
router.get('/prediccion/:municipioId', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const municipioId = req.params.municipioId;

    const response = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioId}/`, {
      params: { api_key: AEMET_API_KEY }
    });

    const datosURL = response.data?.datos;

    if (!datosURL) {
      console.warn("⚠️ No se recibió URL válida en predicción");
      return res.status(204).json([]);
    }

    const datos = await axios.get(datosURL);

    if (!Array.isArray(datos.data)) {
      console.warn("⚠️ La predicción no es un array");
      return res.status(204).json([]);
    }

    res.json(datos.data);
  } catch (err) {
    console.error("❌ Error en predicción:", err.message);
    res.status(500).json({ msg: 'Error al obtener predicción', error: err.message });
  }
});

module.exports = router;