const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const Alerta = require('../models/alerta'); 

//Obtener todas las alertas del usuario autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const alertas = await Alerta.findAll({
      where: { usuario_id: req.userId },
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener alertas', error: error.message });
  }
});

//Crear una nueva alerta
router.post('/', verifyToken, async (req, res) => {
  const { titulo, descripcion } = req.body;

  try {
    const nuevaAlerta = await Alerta.create({
      titulo,
      descripcion,
      usuario_id: req.userId
    });

    res.status(201).json({ msg: 'Alerta creada', alerta: nuevaAlerta });
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear alerta', error: error.message });
  }
});

//Ruta para eliminar una alerta
router.delete('/:id', verifyToken, async (req, res) => {
  const alertaId = req.params.id;
  const userId = req.userId;

  try {
    // Verifica que la alerta existe y pertenece al usuario
    const alerta = await Alerta.findOne({
      where: {
        id: alertaId,
        usuario_id: userId
      }
    });

    if (!alerta) {
      return res.status(404).json({ msg: 'Alerta no encontrada o no autorizada' });
    }

    await alerta.destroy();

    res.json({ msg: 'Alerta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar alerta:', error.message);
    res.status(500).json({ msg: 'Error interno al eliminar', error: error.message });
  }
});

module.exports = router;
