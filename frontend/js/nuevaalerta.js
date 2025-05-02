document.addEventListener('DOMContentLoaded', () => {
  // === ALERTA POR TEMPERATURAS ===
  const municipioSelect = document.getElementById('municipioSelect');

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

  municipioSelect.addEventListener('change', () => {
    cargarPrediccion(municipioSelect.value);
  });

  cargarPrediccion(municipioSelect.value);

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
        alert('Alerta de temperatura guardada correctamente');
        window.location.href = 'misalertas.html';
      })
      .catch(err => {
        console.error('Error al guardar alerta:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });

  // === ALERTA POR COSTAS ===
  const zonaCosteraSelect = document.getElementById('zonaCosteraSelect');

  function cargarPrediccionCostas(zonaId) {
    fetch(`/api/aemet/costas/${zonaId}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción marítima');
        return res.json();
      })
      .then(data => {
        const pred = data[0];

        document.getElementById('tdOleaje').textContent = pred.oleaje || '-';
        document.getElementById('tdVientoMar').textContent = pred.viento || '-';
        document.getElementById('tdFenomenos').textContent = pred.fenomenos || '-';
      })
      .catch(err => {
        console.error('Error al cargar predicción marítima:', err.message);
      });
  }

  zonaCosteraSelect.addEventListener('change', () => {
    cargarPrediccionCostas(zonaCosteraSelect.value);
  });

  cargarPrediccionCostas(zonaCosteraSelect.value);

  document.getElementById('guardarAlertaCostasBtn').addEventListener('click', () => {
    const zonaId = zonaCosteraSelect.value;
    const zonaNombre = zonaCosteraSelect.options[zonaCosteraSelect.selectedIndex].text;

    fetch('/api/alertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        titulo: zonaNombre,
        municipio_id: zonaId,
        descripcion: 'Estado marítimo y fenómenos costeros'
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo guardar la alerta');
        return res.json();
      })
      .then(() => {
        alert('Alerta de costas guardada correctamente');
        window.location.href = 'misalertas.html';
      })
      .catch(err => {
        console.error('Error al guardar alerta marítima:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });
});
