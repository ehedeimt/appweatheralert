const axios = require('axios');

router.get('/prediccion', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const municipioId = '28079'; // Madrid (código INE)

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
