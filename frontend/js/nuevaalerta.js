document.addEventListener('DOMContentLoaded', () => {
  const municipioSelect = document.getElementById('municipioSelect');
  const municipio_id = municipioSelect.value;
  const prediccionTexto = document.getElementById('prediccionTexto');

function cargarPrediccion(municipioId) {
    fetch(`/api/aemet/prediccion/${municipioId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción');
        return res.json();
      })
      .then(data => {
        const hoy = data[0].prediccion.dia[0];
  
        document.getElementById('tdTempMax').textContent = hoy.temperatura?.maxima || '-';
        document.getElementById('tdTempMin').textContent = hoy.temperatura?.minima || '-';
      })
      .catch(err => {
        console.error('Error al cargar la predicción:', err.message);
      });
  }
  

  // Cuando cambie el municipio
  municipioSelect.addEventListener('change', () => {
    cargarPrediccion(municipioSelect.value);
  });

  // Cargar predicción inicial al abrir la página
  if (municipioSelect) {
    cargarPrediccion(municipioSelect.value);
  }
});

document.getElementById('guardarMiAlertaBtn').addEventListener('click', () => {
  const municipioId = municipioSelect.value;
  const municipioNombre = municipioSelect.options[municipioSelect.selectedIndex].text;

  fetch('/api/alertas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
      titulo: municipioNombre,
      municipio_id: municipioId,
      descripcion: 'Temperaturas máximas y mínimas'    
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo guardar la alerta');
    return res.json();
  })
  .then(data => {
    alert('Alerta guardada correctamente');
    console.log('Alerta guardada:', data.alerta);
    window.location.href = 'misalertas.html'; //Redirijo al listado de alertas.
  })
  .catch(err => {
    console.error('Error al guardar alerta:', err.message);
    alert('No se pudo guardar la alerta');
  });
});

