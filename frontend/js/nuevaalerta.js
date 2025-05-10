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

  //Solo cargar si el usuario ha seleccionado una opción válida
  municipioSelect.addEventListener('change', () => {
    const municipioId = municipioSelect.value;
         if (!municipioId) return;
    cargarPrediccion(municipioId);
  });

 if (municipioSelect.value) {
     cargarPrediccion(municipioSelect.value);
  }


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

  //Solo cargar si el usuario ha seleccionado una opción válida
  zonaCosteraSelect.addEventListener('change', () => {
    const zonaId = zonaCosteraSelect.value;
    if (!zonaId) return;
    cargarPrediccionCostas(zonaId);
  });

  if (zonaCosteraSelect.value) {
    cargarPrediccionCostas(zonaCosteraSelect.value);
  }

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
  const provinciaSelect = document.getElementById('provinciaSelect');
  const playaSelect = document.getElementById('playaSelect');

  // Cargar provincias
  const provincias = Object.keys(playasPorProvincia).sort();
  provincias.forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    provinciaSelect.appendChild(opt);
  });

  provinciaSelect.addEventListener('change', () => {
    const provincia = provinciaSelect.value;
    playaSelect.innerHTML = '';

    if (!provincia || !playasPorProvincia[provincia]) {
      playaSelect.innerHTML = '<option value="">-- Primero elige provincia --</option>';
      return;
    }

    playasPorProvincia[provincia].forEach(([nombre, id]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = nombre;
      playaSelect.appendChild(option);
    });
  });

  playaSelect.addEventListener('change', () => {
    cargarPrediccionPlaya(playaSelect.value);
  });

  function cargarPrediccionPlaya(codigoPlaya) {
    fetch(`/api/aemet/playa/${codigoPlaya}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción de playa');
        return res.json();
      })
      .then(data => {
        const hoy = data[0]?.prediccion?.dia?.[0];
        if (!hoy) return;

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

  document.getElementById('guardarAlertaPlayaBtn').addEventListener('click', () => {
    const playaId = playaSelect.value;
    const playaNombre = playaSelect.options[playaSelect.selectedIndex]?.text;

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


// === ALERTA DE MONTAÑA ===
const areaMontanaSelect = document.getElementById('areaMontanaSelect');
const diaMontanaSelect = document.getElementById('diaMontanaSelect');

const nombresAreasMontana = {
  peu1: 'Picos de Europa',
  arn1: 'Pirineo Aragonés',
  nav1: 'Pirineo Navarro',
  cat1: 'Pirineo Catalán',
  rio1: 'Ibérica Riojana',
  arn2: 'Ibérica Aragonesa',
  mad2: 'Sierras de Guadarrama y Somosierra',
  gre1: 'Sierra de Gredos',
  nev1: 'Sierra Nevada'
};

const nombresDiaMontana = {
  0: 'Hoy',
  1: 'Mañana',
  2: 'Pasado Mañana'
};

function cargarPrediccionMontana(areaId, dia) {
  if (!areaId || dia === '') {
    console.warn('Faltan datos: área o día no seleccionados');
    return;
  }

  console.log('Área seleccionada:', areaId);
  console.log('Día seleccionado:', dia);
  console.log(`URL que se consulta: /api/aemet/montana/${areaId}/${dia}`);

  fetch(`/api/aemet/montana/${areaId}/${dia}`)
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Respuesta de servidor montaña:', errorText);
        throw new Error('No se pudo obtener la predicción de montaña');
      }
      return res.json();
    })
    .then(data => {
      const secciones = data[0]?.seccion || [];
      const prediccion = secciones.find(s => s.nombre === 'prediccion');
      const atmosferalibre = secciones.find(s => s.nombre === 'atmosferalibre');
      const sensacion = secciones.find(s => s.nombre === 'sensacion_termica');

      const predHTML = prediccion?.apartado.map(ap => `<p><strong>${ap.cabecera}:</strong> ${ap.texto}</p>`).join('') || '';
      const atmoHTML = atmosferalibre?.apartado.map(ap => `<p><strong>${ap.cabecera}:</strong> ${ap.texto}</p>`).join('') || '';
      const sensHTML = sensacion?.lugar.map(l =>
        `<p><strong>${l.nombre} (${l.altitud}):</strong> Mín: ${l.minima} ºC, Máx: ${l.maxima} ºC</p>`
      ).join('') || '';

      document.getElementById('resultadoMontana').innerHTML = predHTML + atmoHTML + sensHTML;
    })
    .catch(err => {
      console.error('Error al cargar predicción de montaña:', err.message);
      document.getElementById('resultadoMontana').innerHTML = '<p>Error al cargar la predicción</p>';
    });
}

areaMontanaSelect.addEventListener('change', () => {
  cargarPrediccionMontana(areaMontanaSelect.value, diaMontanaSelect.value);
});

diaMontanaSelect.addEventListener('change', () => {
  cargarPrediccionMontana(areaMontanaSelect.value, diaMontanaSelect.value);
});

document.getElementById('guardarAlertaMontanaBtn').addEventListener('click', () => {
  const area = areaMontanaSelect.value;
  const dia = diaMontanaSelect.value;

  if (!area || dia === '') return alert('Selecciona área y día');

  const titulo = `${nombresAreasMontana[area]} - ${nombresDiaMontana[dia]}`;

  fetch('/api/alertas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
      titulo,
      municipio_id: area,
      dia_alerta_montana: parseInt(dia, 10),
      descripcion: 'Predicción de montaña'
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('No se pudo guardar la alerta');
      return res.json();
    })
    .then(() => {
      alert('Alerta de montaña guardada correctamente');
      window.location.href = 'misalertas.html';
    })
    .catch(err => {
      console.error('Error al guardar alerta de montaña:', err.message);
      alert('No se pudo guardar la alerta');
    });
});

});
