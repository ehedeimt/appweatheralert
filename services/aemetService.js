const express = require('express');
const router = express.Router();
const axios = require('axios');

//Predicción meteorológica por municipio
router.get('/prediccion/:municipioId', async (req, res) => {
  const apiKey = process.env.AEMET_API_KEY;
  const municipioId = req.params.municipioId;

  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioId}`, {
      params: { api_key: apiKey }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      console.warn("URL de predicción no disponible");
      return res.status(500).json({ msg: 'No se pudo obtener predicción meteorológica' });
    }

    const datos = await axios.get(urlDatos);
    res.json(datos.data);
  } catch (error) {
    console.error("Predicción ERROR:", error.message);
    res.status(500).json({ msg: 'Error al consultar predicción', error: error.message });
  }
});

// Alertas de tormenta por provincia
router.get('/avisos/:provinciaId', async (req, res) => {
  const apiKey = process.env.AEMET_API_KEY;
  const provinciaId = req.params.provinciaId;

  try {
    const respuesta = await axios.get('https://opendata.aemet.es/opendata/api/avisos_cap/provincias/', {
      params: { api_key: apiKey }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      console.warn("URL de avisos no disponible");
      return res.status(500).json({ msg: 'No se pudo obtener alertas' });
    }

    const datos = await axios.get(urlDatos);
    const alertas = datos.data;

    if (!Array.isArray(alertas)) {
      return res.status(500).json({ msg: 'Formato inesperado en alertas' });
    }

    const alertasFiltradas = alertas.filter(a =>
      a.idProvincia === provinciaId &&
      a.fenomeno?.toLowerCase().includes('tormenta')
    );

    res.json(alertasFiltradas);
  } catch (error) {
    console.error("Avisos ERROR:", {
      mensaje: error.message,
      codigo: error.code,
      url: error.config?.url,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });

    res.status(500).json({ msg: 'Error al consultar alertas', error: error.message });
  }
});

// Predicción marítima por zona costera
router.get('/costas/:zonaId', async (req, res) => {
  const zonaId = req.params.zonaId;
  const apiKey = process.env.AEMET_API_KEY;

  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/maritima/costera/costa/${zonaId}`, {
      params: { api_key: apiKey }
    });

    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      return res.status(500).json({ error: 'No se recibió URL válida de datos marítimos' });
    }

    const datosCostas = await axios.get(urlDatos);
    const zonas = datosCostas.data[0]?.prediccion?.zona;

    if (!Array.isArray(zonas)) {
      return res.status(500).json({ error: 'Estructura inesperada en la respuesta de zonas marítimas' });
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
    console.error('❌ Error al obtener predicción de costas:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de costas' });
  }
});

//Consulta Playas
const iconv = require('iconv-lite');

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

    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = iconv.decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1');
    const datosPlaya = JSON.parse(decoded);

    res.json(datosPlaya);
  } catch (error) {
    console.error('❌ Error al obtener predicción de playa:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de playa' });
  }
});


module.exports = router;
