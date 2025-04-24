const axios = require('axios');
require('dotenv').config();

const AEMET_API_KEY = process.env.AEMET_API_KEY;

const obtenerAlertas = async () => {
  try {
    const res = await axios.get('https://opendata.aemet.es/opendata/api/prediccion/ccaa/hoy/coo', {
      params: { api_key: AEMET_API_KEY }
    });

    const urlDatos = res.data.datos;
    const datosAlertas = await axios.get(urlDatos);

    return datosAlertas.data;
  } catch (error) {
    console.error('❌ Error al obtener alertas de AEMET:', error.message);
    throw error;
  }
};

module.exports = { obtenerAlertas };
