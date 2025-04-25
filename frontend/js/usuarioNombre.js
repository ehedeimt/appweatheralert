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

//Interceptar
document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.querySelector('a[href="login.html"]');

  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      const token = localStorage.getItem('token');

      if (token) {
        e.preventDefault(); //Evita navegar a login.html

        //Mensaje que indica que ya esta el usuario logueado.
        alert('¡Ya estás logueado! Bienvenido de nuevo.');
        
        //Redirijo a la sección mis alertas
        //window.location.href = 'misalertas.html';
      }
    });
  }
});
