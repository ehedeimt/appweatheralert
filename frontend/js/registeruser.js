/*
registeruser.js
Script para gestionar los registros de usuarios.
Funciones:
- Captura el formulario de registro y escucha el envío.
- Valida que las contraseñas coinciden.
- Envía una solicitud POST al backend para registrar nuevo usuario.
- Maneja respuestas correctas y fallos, muestra avisos al usuario.
- Limpia el formulario de registro tras cada registro correcto.
*/ 

//ASEGURO QUE EL CÓDIGO NO SE EJECUTA HASTA QUE TODO EL HTML ESTÉ CARGADO.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm'); //formulario de registro.

    //Control en el envío del formulario.
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        //Obtener valores
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmar = document.getElementById('confirmar').value;
  
        //Si las contraseñas no coinciden se lanza aviso al usuario indicando que revise los campos.
        if (password !== confirmar) {
          alert('Las contraseñas no coinciden. Por favor, revisa los campos.');
          return;
        }
  
        //Petición POST al backend enviando los datos de registro en formato JSON.
        try {
          const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });
  
          //MANEJO DE ERRORES EN EL SERVIDOR BACKEND.
          //Si la respuesta del servidor da un error, se lanza excepción que informe del error que se produjo.
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
  
          //Si el registro es correcto
          const data = await response.json();
          alert('Usuario registrado con éxito. ¡Bienvenido!'); //Se muestra aviso al usuario dando la bienvenida.
          console.log('Usuario registrado:', data);
  
          //Limpia el formulario
          form.reset();
        //SI OCURRE ALGÚN TIPO DE ERROR SE INFORMA MEDIANTE EL SIGUIENTE AVISO.  
        } catch (error) {
          console.error('Error al registrar usuario:', error);
          alert(`El email facilitado ya exite en nuestra base de datos`);
        }
      });
    }
  });
  