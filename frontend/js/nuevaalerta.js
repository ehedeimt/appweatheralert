document.addEventListener('DOMContentLoaded', () => {
  const municipioSelect = document.getElementById('municipioSelect');
  const prediccionTexto = document.getElementById('prediccionTexto');

  function cargarPrediccion(municipioId) {
    fetch(`/api/aemet/prediccion/${municipioId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción');
        return res.json();
      })
      .then(data => {
        const hoy = data[0].prediccion.dia[0];

        const texto = `
          Prob. de precipitación: ${hoy.probPrecipitacion[0].value || 0}% |
          Vel. del viento: ${hoy.viento[0].velocidad || 0} km/h |
          Estado del cielo: ${hoy.estadoCielo[0].descripcion || 'Desconocido'} |
          Temp. Máx: ${hoy.temperatura.maxima}ºC |
          Temp. Mín: ${hoy.temperatura.minima}ºC
        `;

        prediccionTexto.textContent = texto;
      })
      .catch(err => {
        console.error('❌ Error al cargar la predicción:', err.message);
        prediccionTexto.textContent = "❌ No se pudo cargar la predicción.";
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
      descripcion: 'Riesgo de lluvia o viento fuerte' // Puedes personalizar la descripción
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo guardar la alerta');
    return res.json();
  })
  .then(data => {
    alert('✅ Alerta guardada correctamente');
    console.log('Alerta guardada:', data.alerta);
    window.location.href = 'misalertas.html'; // 🔁 Redirigir al listado
  })
  .catch(err => {
    console.error('❌ Error al guardar alerta:', err.message);
    alert('❌ No se pudo guardar la alerta');
  });
});

