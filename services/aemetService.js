const axios = require('axios');
require('dotenv').config();

const AEMET_API_KEY = process.env.AEMET_API_KEY;

const obtenerAlertas = async () => {
  try {
    const res = await axios.get('https://opendata.aemet.es/opendata/api/avisos_cap/ccaa/', {
      params: { api_key: AEMET_API_KEY }
    });

    if (!res.data.datos) throw new Error("No se recibió la URL de datos");

    const datosAlertas = await axios.get(res.data.datos);
    return datosAlertas.data;
  } catch (error) {
    console.warn("⚠️ No se pudo conectar con AEMET. Cargando datos simulados.");
    return [
      {
        titulo: "Alerta de Viento Fuerte",
        descripcion: "Ráfagas de viento superiores a 70 km/h en zonas costeras."
      },
      {
        titulo: "Alerta por Lluvias Intensas",
        descripcion: "Se esperan acumulaciones de más de 50 mm en 12 horas."
      },
      {
        titulo: "Alerta por Tormenta Eléctrica",
        descripcion: "Alta probabilidad de tormentas con rayos en la zona centro."
      }
    ];
  }
};

module.exports = { obtenerAlertas };




/*const axios = require('axios');
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
*/