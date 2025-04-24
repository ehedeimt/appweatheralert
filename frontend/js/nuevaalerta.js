document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('listaAlertas');
  const prediccionTexto = document.getElementById('prediccionTexto');
  const municipioSelect = document.getElementById('municipioSelect');
  const zonaSelect = document.getElementById('zonaSelect');
  const mensajeTormenta = document.getElementById('mensajeTormenta');

  // 🔁 Mostrar predicción meteorológica dinámica (por municipio)
  function cargarPrediccion(municipioId) {
    fetch(`/api/aemet/prediccion/${municipioId}`)
      .then(res => res.json())
      .then(data => {
        const hoy = data[0].prediccion.dia[0];
        const texto = `
          Prob. de precipitación: ${hoy.probPrecipitacion[0].value || 0}% |
          Vel. del viento: ${hoy.viento[0].velocidad || 0} km/h |
          Temp. Máx: ${hoy.temperatura.maxima}ºC |
          Temp. Mín: ${hoy.temperatura.minima}ºC
        `;
        prediccionTexto.textContent = texto;
      })
      .catch(() => {
        prediccionTexto.textContent = "❌ No se pudo cargar la predicción.";
      });
  }

  // 🔁 Consultar alertas de tormentas (por provincia/zona)
  function cargarAlertaTormenta(provinciaId) {
    fetch(`/api/aemet/avisos/${provinciaId}`)
      .then(res => res.json())
      .then(alertas => {
        if (alertas.length === 0) {
          mensajeTormenta.textContent = "✅ No hay alertas de tormentas activas en esta zona.";
        } else {
          mensajeTormenta.innerHTML = `
            ⚠️ Hay ${alertas.length} alerta(s) de tormenta activa(s):<br>
            ${alertas.map(a => `• <strong>${a.nivel}</strong>: ${a.texto}`).join('<br>')}
          `;
        }
      })
      .catch(() => {
        mensajeTormenta.textContent = "❌ No se pudo cargar la información de alertas.";
      });
  }

  // 🔁 Eventos de selección
  municipioSelect.addEventListener('change', () => {
    cargarPrediccion(municipioSelect.value);
  });

  zonaSelect.addEventListener('change', () => {
    cargarAlertaTormenta(zonaSelect.value);
  });

  // 🔁 Carga inicial
  cargarPrediccion(municipioSelect.value);
  cargarAlertaTormenta(zonaSelect.value);

  // ✅ Cargar alertas de AEMET (mock o reales)
  fetch('/api/aemet/alertas-actuales')
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener las alertas de AEMET");
      return res.json();
    })
    .then(alertas => {
      if (!Array.isArray(alertas)) {
        console.error("❌ La respuesta no es un array:", alertas);
        alert("La respuesta del servidor no es válida.");
        return;
      }

      alertas.forEach((alerta, index) => {
        const item = document.createElement('div');
        item.className = 'alerta-item';
        item.innerHTML = `
          <label>
            <input type="radio" name="alertaSeleccionada" value="${index}">
            <strong>${alerta.titulo}</strong><br>
            <small>${alerta.descripcion}</small>
          </label>
        `;
        lista.appendChild(item);
      });

      document.getElementById('guardarAlertaBtn').addEventListener('click', () => {
        const seleccion = document.querySelector('input[name="alertaSeleccionada"]:checked');
        if (!seleccion) return alert('Selecciona una alerta para guardar');

        const alertaElegida = alertas[seleccion.value];

        fetch('/api/alertas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({
            titulo: alertaElegida.titulo,
            descripcion: alertaElegida.descripcion
          })
        })
          .then(res => {
            if (!res.ok) throw new Error("Error al guardar la alerta");
            return res.json();
          })
          .then(() => {
            alert('✅ Alerta guardada con éxito');
            window.location.href = 'misalertas.html';
          })
          .catch(err => {
            console.error('❌ Error al guardar alerta:', err);
            alert('No se pudo guardar la alerta.');
          });
      });
    })
    .catch(err => {
      console.error('❌ Error al obtener alertas de AEMET:', err);
      alert('Error al cargar alertas desde AEMET.');
    });
});
