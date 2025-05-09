const express = require('express');
const router = express.Router();
const axios = require('axios');
const { obtenerAlertas } = require('../services/aemetService');
const iconv = require('iconv-lite');

// Rutas de alertas AEMET
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
      console.warn("No se recibió URL válida en predicción");
      return res.status(204).json([]);
    }

    const datos = await axios.get(datosURL);

    if (!Array.isArray(datos.data)) {
      console.warn("La predicción no es un array");
      return res.status(204).json([]);
    }

    res.json(datos.data);
  } catch (err) {
    console.error("Error en predicción:", err.message);
    res.status(500).json({ msg: 'Error al obtener predicción', error: err.message });
  }
});


// GET /api/aemet/costas/:zonaId
router.get('/costas/:zonaId', async (req, res) => {
  const zonaId = req.params.zonaId;

  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/maritima/costera/costa/${zonaId}`, {
      headers: { api_key: process.env.AEMET_API_KEY }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      throw new Error('No se recibió URL válida de datos marítimos');
    }

    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = require('iconv-lite').decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1'); //Corregir las tildes.
    const datosCostas = JSON.parse(decoded);

    const zonas = datosCostas[0]?.prediccion?.zona;
    if (!Array.isArray(zonas)) {
      throw new Error('Estructura inesperada en zonas marítimas');
    }

    const resultado = [];

    zonas.forEach(zona => {
      zona.subzona?.forEach(subzona => {
        resultado.push({
          nombre: subzona.nombre,
          estado: subzona.texto
        });
      });
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener predicción de costas:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de costas' });
  }
});

// GET /api/aemet/mapa-analisis
router.get('/mapa-analisis', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;

    const response = await axios.get('https://opendata.aemet.es/opendata/api/mapasygraficos/analisis', {
      params: { api_key: AEMET_API_KEY }
    });

    const datosURL = response.data?.datos;
    if (!datosURL) {
      return res.status(204).json({ msg: 'No se encontró enlace al mapa' });
    }

    const mapaResponse = await axios.get(datosURL, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/png');
    res.send(mapaResponse.data);
  } catch (error) {
    console.error("Error al obtener el mapa de análisis:", error.message);
    res.status(500).json({ msg: 'Error al obtener el mapa de análisis', error: error.message });
  }
});

// GET /api/aemet/mapa-incendios?area=c&dia=1
router.get('/mapa-incendios', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const { area = 'c', dia = '1' } = req.query;

    const url = `https://opendata.aemet.es/opendata/api/incendios/mapasriesgo/previsto/dia/${dia}/area/${area}?api_key=${AEMET_API_KEY}`;
    const response = await axios.get(url);

    const datosURL = response.data?.datos;
    if (!datosURL) return res.status(204).json({ msg: 'No se encontró el enlace al mapa de incendios' });

    const mapaResponse = await axios.get(datosURL, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/png');
    res.send(mapaResponse.data);
  } catch (error) {
    console.error("Error al obtener el mapa de incendios:", error.message);
    res.status(500).json({ msg: 'Error al cargar mapa de incendios', error: error.message });
  }
});

//CONSULTA ALERTAS POR PLAYA
/*
router.get('/playa/:codigo', async (req, res) => {
  const codigo = req.params.codigo;

  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${codigo}`, {
      params: { api_key: process.env.AEMET_API_KEY }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      return res.status(500).json({ error: 'No se recibió URL de datos de playa' });
    }

    const datosPlaya = await axios.get(urlDatos);
    res.json(datosPlaya.data);
  } catch (error) {
    console.error('❌ Error al obtener predicción de playa:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de playa' });
  }
});
*/

router.get('/playa/:codigo', async (req, res) => {
  const codigo = req.params.codigo;
  const apiKey = process.env.AEMET_API_KEY;

  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${codigo}`, {
      params: { api_key: apiKey }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      return res.status(500).json({ error: 'No se recibió URL de datos de playa' });
    }

    // ✅ Decodificar correctamente la respuesta
    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = iconv.decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1');

    // ✅ Verificar que el JSON es válido
    const datosPlaya = JSON.parse(decoded);

    res.json(datosPlaya);
  } catch (error) {
    console.error('❌ Error al obtener predicción de playa:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de playa' });
  }
});

//Predicción de montaña
router.get('/montana/:areaId/:dia', async (req, res) => {
  const areaId = req.params.areaId;
  const dia = req.params.dia; // 0 para hoy, 1 para mañana, etc.
  const apiKey = process.env.AEMET_API_KEY;

  try {
    const url = `https://opendata.aemet.es/opendata/api/prediccion/especifica/montaña/pasada/area/${areaId}/dia/${dia}`;
    const respuesta = await axios.get(url, { params: { api_key: apiKey } });

    const datosURL = respuesta.data?.datos;
    if (!datosURL) {
      return res.status(500).json({ error: 'No se recibió URL de datos de montaña' });
    }

    const respuestaDatos = await axios.get(datosURL);
    res.json(respuestaDatos.data);
  } catch (error) {
    console.error('❌ Error al obtener predicción de montaña:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de montaña' });
  }
});




module.exports = router;