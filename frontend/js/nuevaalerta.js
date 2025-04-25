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
    console.log("🔍 Consultando alertas para provincia:", provinciaId);
    fetch(`/api/aemet/avisos/${provinciaId}`)
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.msg || 'Error desconocido');
        }
        return res.json();
      })
      .then(alertas => {
        const mensajeTormenta = document.getElementById('mensajeTormenta');
  
        if (alertas.length === 0) {
          mensajeTormenta.textContent = "✅ No hay alertas de tormentas activas en esta zona.";
        } else {
          mensajeTormenta.innerHTML = `
            ⚠️ Se encontraron ${alertas.length} alerta(s) de tormenta:<br>
            ${alertas.map(a => `
              • <strong>${a.nivel || 'Nivel desconocido'}</strong>: ${a.texto || 'Sin descripción'}
            `).join('<br>')}
          `;
        }
      })
      .catch(err => {
        console.error('❌ Error al obtener alertas:', err.message);
        document.getElementById('mensajeTormenta').textContent = "❌ No se pudo consultar las alertas de tormenta. Intenta más tarde.";
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
