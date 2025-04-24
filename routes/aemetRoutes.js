router.get('/alertas-actuales', async (req, res) => {
    try {
      const alertasAemet = await obtenerAlertas();
  
      const simplificadas = alertasAemet
        .filter(a => a.titulo && a.descripcion)
        .map(a => ({
          titulo: a.titulo,
          descripcion: a.descripcion
        }));
  
      res.json(simplificadas);
    } catch (error) {
      res.status(500).json({ msg: 'Error al obtener alertas de AEMET', error: error.message });
    }
  });
  