/*
login.js
Script apra autenticar usuarios para el formulario de login.
Con este fichero se podrá gestionar:
- Inicio de sesión de los usuarios.
- Captura y valida el envío del formulario.
- Envia las credenciales mediante petición POST.
- Guarda el token generado para el usuario para el tratamiento posterior de las alertas.
- Redirige al usuario a la página principal mostrando el mensaje de bienvenida.
- Manejar respuestas y errores.
- Mensajes para la depuración.
*/ 

/*
ESPERA LA CARGA DEL DOM PARA GARANTIZAR LA CARGA DEL HTML ANTES DE EJECUTAR EL SCRIPT
*/
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm'); //Captura del formulario de login.

  /*EVENTO ENVÍO DEL FORMULARIO*/
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value; //obtiene valor email.
    const password = document.getElementById('password').value; //obtiene valor password.

    /*ENVIO DE DATOS AL BACKEND
    - Llamada POST para autenticar al usuario enviando los datos en formato json.
    */
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      /*VALIDACIÓN DE LA RESPUESTA Y DEPURACIÓN
      - Si la respuesta da un error lo escribe como una excepción para poder revisarlo.
      */
      if (!response.ok) {
        const error = await response.json();
        console.error('Error del backend:', error);
        throw new Error(error.msg || error.error || error.message || 'Error desconocido');
      }

      /*PROCESO DE RESPUESTA CORRECTA
      - Obtener informaciónd el usuario autenticado.
      */
      const data = await response.json();
      console.log('Usuario autenticado:', data);

      //Guardo token y nombre del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuarioNombre', data.user.name);

      //Construcción del mensaje de bienvenida y redireccionamiento a la página index.
      alert('Inicio de sesión exitoso. Bienvenido ' + data.user.name + '!');
      window.location.href = 'index.html';
    
    //Muestra mensaje si se produce otro error.  
    } catch (error) {
      console.error('Error en el catch:', error);
      alert('Error al iniciar sesión: ' + error.message);
    }
  });
});