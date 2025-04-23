document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaAlertas");
  const btnNueva = document.getElementById("nuevaAlertaBtn");

  // Redirigir si no hay token (no está logueado)
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para acceder a tus alertas.");
    window.location.href = "login.html";
    return;
  }

  btnNueva.addEventListener("click", () => {
    window.location.href = "formulario.html";
  });

  function cargarAlertas() {
    fetch("/api/alertas", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
    .then(async res => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Error al cargar alertas");
      }
      return res.json();
    })
    .then(alertas => {
      tabla.innerHTML = "";

      if (!Array.isArray(alertas)) {
        throw new Error("La respuesta del servidor no es válida.");
      }

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
    })
    .catch(err => {
      console.error("❌ Error al obtener alertas:", err.message);
      alert(err.message);

      // Si el token fue inválido o expiró, redirige al login
      if (err.message.includes("Token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioNombre");
        window.location.href = "login.html";
      }
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
          "Authorization": "Bearer " + token
        }
      })
      .then(() => cargarAlertas())
      .catch(err => {
        console.error("❌ Error al eliminar alerta:", err.message);
        alert("No se pudo eliminar la alerta.");
      });
    }
  }

  cargarAlertas();
});


/*
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
  */