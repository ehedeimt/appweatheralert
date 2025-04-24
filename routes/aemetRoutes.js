const express = require('express');
const router = express.Router(); // 💡 ESTO ES LO QUE FALTABA
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
router.get('/prediccion', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const municipioId = '28079'; // Madrid (puedes hacerlo dinámico después)

    const response = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioId}/`, {
      params: { api_key: AEMET_API_KEY }
    });

    const datosURL = response.data.datos;
    const datos = await axios.get(datosURL);

    res.json(datos.data);
  } catch (err) {
    console.error("❌ Error al obtener predicción:", err.message);
    res.status(500).json({ msg: 'No se pudo obtener la predicción de AEMET' });
  }
});

module.exports = router;
