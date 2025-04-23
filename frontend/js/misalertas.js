document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.getElementById("tablaAlertas");
    const btnNueva = document.getElementById("nuevaAlertaBtn");
  
    btnNueva.addEventListener("click", () => {
      window.location.href = "formulario.html";
    });
  
    function cargarAlertas() {
      fetch("/api/alertas", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      })
      .then(res => res.json())
      .then(alertas => {
        tabla.innerHTML = "";
        alertas.forEach(alerta => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${alerta.titulo}</td>
            <td>${alerta.descripcion}</td>
            <td><button class="editar" onclick="editarAlerta(${alerta.id})">Editar</button></td>
            <td><button class="eliminar" onclick="eliminarAlerta(${alerta.id})">Eliminar</button></td>
          `;
          tabla.appendChild(fila);
        });
      });
    }
  
    window.editarAlerta = function(id) {
      window.location.href = `formulario.html?id=${id}`;
    }
  
    window.eliminarAlerta = function(id) {
      if (confirm("¿Seguro que deseas eliminar esta alerta?")) {
        fetch(`/api/alertas/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
          }
        }).then(() => cargarAlertas());
      }
    }
  
    cargarAlertas();
  });