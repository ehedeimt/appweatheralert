// js/usuarioNombre.js
document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuario = localStorage.getItem("usuarioNombre");
    if (nombreUsuario) {
      const mensajeUsuario = document.getElementById("mensajeUsuario");
      if (mensajeUsuario) {
        mensajeUsuario.textContent = `Bienvenido, ${nombreUsuario}`;
      }
    }
  });
  