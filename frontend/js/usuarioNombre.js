/*
usuarioNombre.js
Script para mostrar el estado de la sesión del usuario en la cabecera.
Funciones:
- Si el usuario está autenticado, es decir, hay token almacenado, muestra su nombre y el botón de cerrar sesión.
- El botón cerrar sesión elimina los datos de la sesión del navegador y redirige al usuario a la página de login.
- Control cuando el usuario ya está autenticado. Mostrando un aviso y redirigiendo al usuario la página de misalertas.html.
*/ 


//Recupero elementos del DOM almacenados para construir el saludo.
document.addEventListener('DOMContentLoaded', () => {
  const nombreUsuario = localStorage.getItem("usuarioNombre");//Nombre de usuario almacenado.
  const token = localStorage.getItem("token");//Token almacenado.

  const contenedorUsuario = document.getElementById("contenedorUsuario");//Usuario
  const mensajeUsuario = document.getElementById("mensajeUsuario");//Mensaje
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");//Botón cierre sesión.

  //Si el usuario está autenticado y existen los elementos...
  if (token && nombreUsuario && contenedorUsuario && mensajeUsuario) {
    mensajeUsuario.textContent = `Bienvenido, ${nombreUsuario}`;//Se el saludo de bienvenida con el nombre del usuario concatenado
    contenedorUsuario.style.display = "flex";//Se hace visible el contenedor.
  }

  //Al usar el botón de cerrar sesión se eliminan los datos almacenados en localStorage y se redirige a login.html
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioNombre");
      window.location.href = "login.html";
    });
  }
});

//INTERCEPTAR UNA SESIÓN ACTIVA PARA NO VOLVER A PEDIR CREDENCIALES.
document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.querySelector('a[href="login.html"]');

  //Si el usuario tiene token cuando se hace click en login...
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      const token = localStorage.getItem('token');

      if (token) {
        e.preventDefault(); //Evita navegar a login.html

        //Alerta al usuario indicando que ya tiene la sesión activa.
        alert('¡Ya estás logueado! Bienvenido de nuevo.');
        
        //Redirijo a la sección mis alertas
        window.location.href = 'misalertas.html';
      }
    });
  }
});