/*
aemetRoutes.js --> Rutas para consultar datos meteorológicos oficiales de la AEMET.
Endpoints disponibles: 
- ****ESTA SE PUEDE QUITAR****GET /api/aemet/alertas-actuales
- GET /api/aemet/prediccion/:municipioId
- GET /api/aemet/costas/:zonaId
- GET /api/aemet/mapa-analisis
- GET /api/aemet/mapa-incendios?area=p|c&dia=1..6
- GET /api/aemet/playa/:codigo
- GET /api/aemet/montana/:area/:dia

Características:
- Cada ruta consulta la API oficial de AEMET.
- Algunas respuestas (como playas, costas y montaña) deben decodificarse con iconv-lite.
- Devuelve JSON o imágenes listas para mostrar en el frontend.

Necesita:
- Variable de entorno AEMET_API_KEY válida y configurada en fichero .env
*/



//IMPORTACIONES Y CONFIGURACIONES
const express = require('express');
const router = express.Router();//Configuro router express.
const axios = require('axios');//Necesario para realizar las llamadas a la AEMET.
//const { obtenerAlertas } = require('../services/aemetService');//Necesario para la para obtener las alertas.
const iconv = require('iconv-lite');//Necesario para decodificar las respuestas en ISO-8859-1 y que no se vean las tildes más codificadas.

/*
OBTENER ALERTAS DEL USUARIO
- Llama a la función obtenerAlertas() en el fichero aemetService.js

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

*/

/*
PREDICCIÓN PARA TEMPERATURAS MAXIMAS Y MÍNINMAS POR MUNICIPIO
- Hace una petición a la AEMET que de vuelve la url de datos.
- Se obtiene la predicción desde la segunda URL.
- Devuelve array con la información de la AEMET.
*/
router.get('/prediccion/:municipioId', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const municipioId = req.params.municipioId;

    //Llamada a la AEMET pasando como parámetros el idmunicipio y la api_key.
    const response = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${municipioId}/`, {
      params: { api_key: AEMET_API_KEY }
    });

    //Almaceno la url de datos que responde AEMET.
    const datosURL = response.data?.datos;

    //Contro para devolver un aviso si no se recibe una URL válida o el JSON.
    if (!datosURL) {
      console.warn("No se recibió URL válida en predicción");
      return res.status(204).json([]);
    }

    const datos = await axios.get(datosURL);

    //Aviso si se producce error que no es un array.
    if (!Array.isArray(datos.data)) {
      console.warn("La predicción no es un array");
      return res.status(204).json([]);
    }

    //Resultado JSON.
    res.json(datos.data);
    
    //Registro de errores si se produce.
  } catch (err) {
    console.error("Error en predicción:", err.message);
    res.status(500).json({ msg: 'Error al obtener predicción', error: err.message });
  }
});


/*
PREDICCIÓN PARA ESTADO MARÍTIMO Y FENÓMENOS COSTEROS.
- Devuelve el estado marítimo por subzonas dentro de una zona costera.
- Decodificación para las tildes.
- Transforma la estructura.
*/
router.get('/costas/:zonaId', async (req, res) => {
  const zonaId = req.params.zonaId;

  //Llamada a la AEMET pasando como parámetros el zonaId y la api_key.
  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/maritima/costera/costa/${zonaId}`, {
      headers: { api_key: process.env.AEMET_API_KEY }
    });

    //Almaceno la url de datos que responde AEMET.
    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      throw new Error('No se recibió URL válida de datos marítimos');
    }

    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = require('iconv-lite').decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1'); //Decodificar para corregir las tildes.
    const datosCostas = JSON.parse(decoded);
    
    //Guardo la predicción en zonas.
    const zonas = datosCostas[0]?.prediccion?.zona;
    if (!Array.isArray(zonas)) {
      throw new Error('Estructura inesperada en zonas marítimas');
    }

    const resultado = [];

    //Revisión de las estructuras.
    zonas.forEach(zona => {
      zona.subzona?.forEach(subzona => {
        resultado.push({
          nombre: subzona.nombre,
          estado: subzona.texto
        });
      });
    });
    
    //Resultado en json.
    res.json(resultado);

    //Registro de errores y avisos.
  } catch (error) {
    console.error('Error al obtener predicción de costas:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de costas' });
  }
});

/*
OBTENER MAPA ANÁLISIS EN LA PÁGINA INICIAL.
- Devuelve la imagen del mapa de análisis meteorológico del día.
*/
router.get('/mapa-analisis', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;

    //Solo necesito enviar la API_KEY porque el va a devolver un mapa mundial para el día actual.
    const response = await axios.get('https://opendata.aemet.es/opendata/api/mapasygraficos/analisis', {
      params: { api_key: AEMET_API_KEY }
    });

    //Control de lo que se recibe.
    const datosURL = response.data?.datos;
    if (!datosURL) {
      return res.status(204).json({ msg: 'No se encontró enlace al mapa' });
    }

    //Recepción del mapa cambiando el encabezado para que la respuesta sea como imagen.
    const mapaResponse = await axios.get(datosURL, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/png');
    res.send(mapaResponse.data);

    //Control de errores.
  } catch (error) {
    console.error("Error al obtener el mapa de análisis:", error.message);
    res.status(500).json({ msg: 'Error al obtener el mapa de análisis', error: error.message });
  }
});

/*
OBTENER MAPA RIESGO DE INCENDIOS CON OPCIONES PARA ELECCIÓN DE LA PREDICCIÓN.
- Devuelve la imagen del mapa con la predicción de riesgos de incendio para la selección.
- Se le pasan parámetros area y día.
*/
router.get('/mapa-incendios', async (req, res) => {
  try {
    const AEMET_API_KEY = process.env.AEMET_API_KEY;
    const { area = 'c', dia = '1' } = req.query;
    //Construcción de la url pasando el día y el area seleccionada por el usuario más la API_KEY de la AEMET.
    const url = `https://opendata.aemet.es/opendata/api/incendios/mapasriesgo/previsto/dia/${dia}/area/${area}?api_key=${AEMET_API_KEY}`;
    const response = await axios.get(url);

    const datosURL = response.data?.datos;
    if (!datosURL) return res.status(204).json({ msg: 'No se encontró el enlace al mapa de incendios' });

    //Receptción del mapa cambiando el encabezado para que la respuesta sea como imagen.
    const mapaResponse = await axios.get(datosURL, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/png');
    res.send(mapaResponse.data);

    //Controles de erores.
  } catch (error) {
    console.error("Error al obtener el mapa de incendios:", error.message);
    res.status(500).json({ msg: 'Error al cargar mapa de incendios', error: error.message });
  }
});


/*
OBTENER PREDICCIÓN PARA LAS PLAYAS.
- Devuelve la predicción para una playa.
- Se corrigen las tildes mal codificadas.
*/
router.get('/playa/:codigo', async (req, res) => {
  const codigo = req.params.codigo;
  const apiKey = process.env.AEMET_API_KEY;
  //Llamada a la AEMET pasando el código de playa y la API_KEY.
  try {
    const respuesta = await axios.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/playa/${codigo}`, {
      params: { api_key: apiKey }
    });

    //URL de datos recibida de la AEMET.
    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      return res.status(500).json({ error: 'No se recibió URL de datos de playa' });
    }

    //Se ven datos más codificados, se decodificar la respueta.
    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = iconv.decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1');

    //Y verificar que el JSON es válido
    const datosPlaya = JSON.parse(decoded);

    //Respuesta json.
    res.json(datosPlaya);

    //Manejo de errores.
  } catch (error) {
    console.error('Error al obtener predicción de playa:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de playa' });
  }
});


/*
OBTENER PREDICCIÓN DE MONTAÑA.
- Devuelve la predicción de montaña para una zona y un día determinado las zonas y días las establece la AEMET. Detecto para esta alerta que hay predicciones que la AEMET no devuelve información en caso que se elijan días distintos.
- Corrección de caracteres. Decodificación de la respuesta.
*/
router.get('/montana/:area/:dia', async (req, res) => {
  const { area, dia } = req.params;
  const apiKey = process.env.AEMET_API_KEY;

  //Se llama a la AEMET pasando el área y día seleccioanda por el usuario además de la API_KEY.
  try {
    const respuesta = await axios.get(
      `https://opendata.aemet.es/opendata/api/prediccion/especifica/montaña/pasada/area/${area}/dia/${dia}`,
      {
        params: { api_key: apiKey }
      }
    );

    //Obtención de la url de datos.
    const urlDatos = respuesta.data?.datos;
    if (!urlDatos) {
      return res.status(500).json({ error: 'No se recibió URL de datos de montaña' });
    }

    //Corrección de caracteres en la respuesta obtenida.
    const respuestaDatos = await axios.get(urlDatos, { responseType: 'arraybuffer' });
    const decoded = iconv.decode(Buffer.from(respuestaDatos.data), 'ISO-8859-1');
    const datosMontana = JSON.parse(decoded);

    //Respuesta en json.
    res.json(datosMontana);

    //Manejo de erroes.
  } catch (error) {
    console.error('Error al obtener predicción de montaña:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la predicción de montaña' });
  }
});

module.exports = router;