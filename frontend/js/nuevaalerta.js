document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('listaAlertas');
  
    fetch('/api/aemet/alertas-actuales')
      .then(res => res.json())
      .then(alertas => {
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
          .then(res => res.json())
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
  