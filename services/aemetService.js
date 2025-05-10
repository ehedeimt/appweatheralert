/*
aemetServices.js --> Modulo de rutas de Express que sirve como puente o proxy entre la aplicación y la API oficial de la AEMET.

Endpoints disponibles:
- GET /api/aemet/prediccion/:municipioId --> Predicción Temperaturas máximas y minimas.
- GET /api/aemet/avisos/:provinciaId --> %%%%%%ACLARAR ESTA PARTE%%%%%%
- GET /api/aemet/costas/:zonaId --> Predicción marítima por zona costera.
- GET /api/aemet/playa/:codigo --> Predicción de playas (requiere decodificación ISO-8859-1).

Detalles:
- Usa axios para acceder a la API pública de AEMET.
- La mayoría de endpoints requieren dos peticiones: una para obtener la URL de datos y otra para descargar los datos reales.
- Devuelve datos estructurados y filtrados al frontend.

Necesita:
- Variable de entorno AEMET_API_KEY.
*/

//CONFIGURACIÓN INICIAL
const express = require('express');
const router = express.Router();//Creo router de express.
const axios = require('axios');//Axios para hacer llamadas a la API de AEMET.

//PREDICCIÓN METEOROLÓGICA POR MUNICIPIO
/*
Recibe por parámetro el municipioId
Hace petición a la AEMET con el API KEY configuraco en .env
AEMET responde con url de datos reales. Se hace segunda petición a esa URL
Devuelve json con la predicción.
*/
router.get('/prediccion/:municipioId', async (req, res) => {
  const apiKey = process.env.AEMET_API_KEY;
  const municipioId = req.params.municipioId;

  //Petición a AEMET
  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioId}`, {
      params: { api_key: apiKey }
    });

    //Avisos si no se obtiene respuesta en la segunda llamada de la url de datos.
    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      console.warn("URL de predicción no disponible");
      return res.status(500).json({ msg: 'No se pudo obtener predicción meteorológica' });
    }

    //Json de la respueta.
    const datos = await axios.get(urlDatos);
    res.json(datos.data);
  } catch (error) {
    console.error("Predicción ERROR:", error.message);
    res.status(500).json({ msg: 'Error al consultar predicción', error: error.message });
  }
});


// Alertas de tormenta por provincia
/*
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
});*/

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

    // 🧩 Paso importante: usar arraybuffer y decodificar ISO-8859-1
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
