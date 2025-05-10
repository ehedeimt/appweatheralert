/*
misalertas.js
Script para manejar las alertas de los usuarios.
Funciones:
- Verificar que el usuario está autenticado mediante token JWT.
- Carga del listado de alertas obtenidas de la BBDD y las muestra en una tabla.
- Creación de nuevas alertas.
- Botón editar alerta: actualmente sin funcionalidad.
- Eliminar alertas que tenga activas el usuario.
Llamadas al backend:
- GET /api/alertas
- DELETE /api/alertas/:id
*/ 

//CONTROLA LA EJECUCIÓN DE TODO EL CÓDIGO UNA VEZ SE HA CARGADO LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaAlertas");//Tabla que mostrará las alertas.
  const btnNueva = document.getElementById("nuevaAlertaBtn");//Botón creación nueva alerta.

  //Redirige al usuario si no hay token (no está logueado)
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para acceder a tus alertas.");
    window.location.href = "login.html";
    return;
  }

  btnNueva.addEventListener("click", () => {
    window.location.href = "nuevaalerta.html";
  });

  //Carga las alertas que tenga el usuario registrdas en la BBDD. Llamada hecha a Backend.
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

      //Estructura de la tabla que se mostrará con las alertas configuradas por el usuario.
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
      console.error("Error al obtener alertas:", err.message);
      alert(err.message);

      //Si el token no es válido o ha expirado, se redirige al usuario a la página de login.
      if (err.message.includes("Token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioNombre");
        window.location.href = "login.html";
      }
    });
  }

  //Funcion para editar Alerta. Actualmente no tiene funcionalidad.
  window.editarAlerta = function(id) {
    window.location.href = `formulario.html?id=${id}`;
  }

  //FUNCION PARA ELIMINAR ALERTA 
  window.eliminarAlerta = function(id) {
    if (confirm("¿Seguro que deseas eliminar esta alerta?")) {//Se confirma si se desea eliminar la alerta
      fetch(`/api/alertas/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      })
      .then(() => cargarAlertas()) //Se cargan las alertas restantes.
      .catch(err => {
        console.error("Error al eliminar alerta:", err.message);
        alert("No se pudo eliminar la alerta.");//Muestra error si no fue posible eliminar la alerta.
      });
    }
  }

  cargarAlertas();
});