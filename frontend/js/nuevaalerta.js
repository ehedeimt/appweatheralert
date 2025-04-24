document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('listaAlertas');
  const prediccionTexto = document.getElementById('prediccionTexto');
  const municipioSelect = document.getElementById('municipioSelect');

  // 🔁 Mostrar predicción meteorológica dinámica
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
        prediccionTexto.textContent = "No se pudo cargar la predicción.";
      });
  }

  // 🔁 Cargar predicción al cambiar el municipio
  municipioSelect.addEventListener('change', () => {
    cargarPrediccion(municipioSelect.value);
  });

  // 🔁 Cargar predicción inicial
  cargarPrediccion(municipioSelect.value);

  // ✅ Cargar alertas como ya tienes
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


/*
document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('listaAlertas');
  
    fetch('/api/aemet/alertas-actuales')
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener las alertas de AEMET");
        return res.json();
      })
      .then(alertas => {
        // ✅ Validación importante
        if (!Array.isArray(alertas)) {
          console.error("❌ La respuesta no es un array:", alertas);
          alert("La respuesta del servidor no es válida. Verifica si la API Key de AEMET es correcta.");
          return;
        }
  
        // ✅ Insertar cada alerta en el DOM
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
  
        // ✅ Acción de guardar alerta seleccionada
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
  document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('listaAlertas');
    const prediccionTexto = document.getElementById('prediccionTexto');
  
    // 🔸 1. Cargar predicción de AEMET (Madrid por defecto)
    function cargarPrediccion() {
      fetch('/api/aemet/prediccion')
        .then(res => res.json())
        .then(data => {
          const hoy = data[0].prediccion.dia[0];
          const texto = `
            Estado del cielo: ${hoy.estadoCielo[0].descripcion || 'No disponible'} |
            Temp. Máxima: ${hoy.temperatura.maxima}ºC |
            Temp. Mínima: ${hoy.temperatura.minima}ºC
          `;
          prediccionTexto.textContent = texto;
        })
        .catch(() => {
          prediccionTexto.textContent = "No se pudo cargar la predicción.";
        });
    }
  
    cargarPrediccion();
  
    // 🔸 2. Cargar alertas disponibles desde AEMET o simuladas
    fetch('/api/aemet/alertas-actuales')
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener las alertas de AEMET");
        return res.json();
      })
      .then(alertas => {
        if (!Array.isArray(alertas)) {
          console.error("❌ La respuesta no es un array:", alertas);
          alert("La respuesta del servidor no es válida. Verifica si la API Key de AEMET es correcta.");
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
  
        // 🔸 3. Guardar la alerta seleccionada
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
  */