document.addEventListener('DOMContentLoaded', () => {
  const nombreUsuario = localStorage.getItem("usuarioNombre");
  const token = localStorage.getItem("token");

  const contenedorUsuario = document.getElementById("contenedorUsuario");
  const mensajeUsuario = document.getElementById("mensajeUsuario");
  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

  if (token && nombreUsuario && contenedorUsuario && mensajeUsuario) {
    mensajeUsuario.textContent = `Bienvenido, ${nombreUsuario}`;
    contenedorUsuario.style.display = "flex";
  }

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioNombre");
      window.location.href = "login.html";
    });
  }
});