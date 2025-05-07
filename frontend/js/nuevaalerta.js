document.addEventListener('DOMContentLoaded', () => {
  // === ALERTA POR TEMPERATURAS ===
  const municipioSelect = document.getElementById('municipioSelect');

  function cargarPrediccion(municipioId) {
    fetch(`/api/aemet/prediccion/${municipioId}`)
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Respuesta inválida:', errorText);
          throw new Error('No se pudo obtener la predicción');
        }
        return res.json();
      })
      .then(data => {
        const hoy = data[0]?.prediccion?.dia?.[0];
        document.getElementById('tdTempMax').textContent = hoy?.temperatura?.maxima || '-';
        document.getElementById('tdTempMin').textContent = hoy?.temperatura?.minima || '-';
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
      .then(() => {
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
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Respuesta costas inválida:', errorText);
          throw new Error('No se pudo obtener la predicción marítima');
        }
        return res.json();
      })
      .then(data => {
        const tbody = document.getElementById('tbodyCostas');
        tbody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = `<td colspan="2">Sin información disponible para esta zona.</td>`;
          tbody.appendChild(row);
          return;
        }

        data.forEach(subzona => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${subzona.nombre}</td>
            <td>${subzona.estado}</td>
          `;
          tbody.appendChild(row);
        });
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

  // === ALERTA POR PLAYAS ===
  const playaSelect = document.getElementById('playaSelect');

  function cargarPrediccionPlaya(codigoPlaya) {
    fetch(`/api/aemet/playa/${codigoPlaya}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción de playa');
        return res.json();
      })
      .then(data => {
        const hoy = data[0]?.prediccion?.dia?.[0];
  
        if (!hoy) {
          console.warn("No se encontró predicción para hoy");
          return;
        }
  
        // Formatear la fecha de YYYYMMDD a DD/MM/YYYY
        const rawFecha = hoy.fecha?.toString() || '';
        const fechaFormateada = rawFecha.length === 8
          ? `${rawFecha.slice(6, 8)}/${rawFecha.slice(4, 6)}/${rawFecha.slice(0, 4)}`
          : '-';
  
        document.getElementById('tdFechaPlaya').textContent = fechaFormateada;
        document.getElementById('tdCieloPlaya').textContent = hoy.estadoCielo?.descripcion1 || '-';
        document.getElementById('tdUV').textContent = hoy.uvMax?.valor1 || '-';
        document.getElementById('tdTempAgua').textContent = hoy.tAgua?.valor1 || '-';
        document.getElementById('tdOleaje').textContent = hoy.oleaje?.descripcion1 || '-';
        document.getElementById('tdViento').textContent = hoy.viento?.descripcion1 || '-';
        document.getElementById('tdSTermica').textContent = hoy.sTermica?.descripcion1 || hoy.stermica?.descripcion1 || '-';
      })
      .catch(err => {
        console.error('Error al cargar predicción de playa:', err.message);
      });
  }
  

  playaSelect.addEventListener('change', () => {
    cargarPrediccionPlaya(playaSelect.value);
  });

  cargarPrediccionPlaya(playaSelect.value);

  document.getElementById('guardarAlertaPlayaBtn').addEventListener('click', () => {
    const playaId = playaSelect.value;
    const playaNombre = playaSelect.options[playaSelect.selectedIndex].text;

    fetch('/api/alertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        titulo: playaNombre,
        municipio_id: playaId,
        descripcion: 'Predicción para playa'
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo guardar la alerta');
        return res.json();
      })
      .then(() => {
        alert('Alerta de playa guardada correctamente');
        window.location.href = 'misalertas.html';
      })
      .catch(err => {
        console.error('Error al guardar alerta de playa:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });
});