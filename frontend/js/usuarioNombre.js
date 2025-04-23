document.addEventListener('DOMContentLoaded', () => {
  const nombreUsuario = localStorage.getItem("usuarioNombre");
  const mensajeUsuario = document.getElementById("mensajeUsuario");
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

  if (nombreUsuario && mensajeUsuario) {
    mensajeUsuario.textContent = `Bienvenido, ${nombreUsuario}`;
  }

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioNombre");
      window.location.href = "login.html";
    });
  }
});


/*
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
  */