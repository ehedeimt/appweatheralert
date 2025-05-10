/*
alertasRotues.js --> Rutas protegidas para la gestión de alertas personalizadas del usuario.
Todas las rutas requieren autenticación mediante token JWT.
- GET /api/alertas: Lista todas las alertas del usuario autenticado.
- POST /api/alertas: Crea una nueva alerta con los datos proporcionados.
- DELETE /api/alertas/:id - Elimina una alerta si pertenece al usuario autenticado.

Necesita:
- Middleware verifyToken para validar el token JWT.
- Modelo Alerta (Sequelize).
 */


//CONFIGURACIÓN E IMPORTACIONES
const express = require('express');
const router = express.Router(); //Configuro router de express
const verifyToken = require('../middlewares/verifyToken');//Requiere middlewares/verifyToken
const Alerta = require('../models/alerta'); //Y el modelo de la tabla alerta.

/*
CARGAR TODAS LAS ALERTAS.
- Solo permite el acceso si el token es válido.
- busca todas las alertas en la base de datos por el usuario_id
- las ordena por fecha de creación descendente
- Devuelve las alertas en JSON.
*/
router.get('/', verifyToken, async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      where: { usuario_id: req.userId },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(alertas);
    //CONTROL DE AVISOS SI DA ERROR.
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener alertas', error: error.message });
  }
});

/*
CREAR NUEVA ALERTA.
- Extrae los campos necesarios del cuerpo de la petición: titulo, municipio_id, descripcion, dia_alerta_montana
- Valida campos obligatorios
- Crea la nueva alerta asociada al usuario autenticado.
- Convierte dia_alerta_montana a númérico si viene.
- Devuelve la alerta creada.
*/
router.post('/', verifyToken, async (req, res) => {
  const { titulo, municipio_id, descripcion, dia_alerta_montana } = req.body;
  //Validación campos obligatorios.
  if (!titulo || !municipio_id || !descripcion) {
    return res.status(400).json({ msg: 'Faltan datos obligatorios' });
  }
  //Crea la nueva alerta.
  try {
    const nuevaAlerta = await Alerta.create({
      titulo,
      municipio_id,
      descripcion,
      usuario_id: req.userId,
      dia_alerta_montana: dia_alerta_montana !== undefined ? parseInt(dia_alerta_montana, 10) : null
    });

    //Avisos de creación correcta o errores.
    res.status(201).json({ msg: 'Alerta creada', alerta: nuevaAlerta });
  } catch (error) {
    console.error('Error al crear alerta:', error.message);
    res.status(500).json({ msg: 'Error al crear alerta', error: error.message });
  }
});

/*
ELIMINAR ALERTA.
- Obtiene el id de la alerta.
- Verifica que la alerta pertenezca al usuario autenticado.
- Si no existe o no es del usuario da error 404.
- Si existe la elimina.
*/
router.delete('/:id', verifyToken, async (req, res) => {
  const alertaId = req.params.id;
  const userId = req.userId;
  //Verificación de la alerta.
  try {
    const alerta = await Alerta.findOne({
      where: {
        id: alertaId,
        usuario_id: userId
      }
    });

    //Si la alerta no se encuentra o no está autorizada, avisa.
    if (!alerta) {
      return res.status(404).json({ msg: 'Alerta no encontrada o no autorizada' });
    }

    //Si la encuenta, la elimina.
    await alerta.destroy();

    //Avisa que la alerta se ha eliminado correctamente
    res.json({ msg: 'Alerta eliminada correctamente' });
  } catch (error) {
    //Si hay errores se registran en consola y se avisa.
    console.error('Error al eliminar alerta:', error.message);
    res.status(500).json({ msg: 'Error interno al eliminar', error: error.message });
  }
});
//Permite usar este router por index.js
module.exports = router;
