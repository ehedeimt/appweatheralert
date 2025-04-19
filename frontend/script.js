
/*CÓDIGO PARA CONTROLAR QUE COINCIDAN LAS CONTRASEÑAS*/
/*
document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.querySelector('form[action="/procesar-registro"]');

    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', (e) => {
            const password = document.getElementById('password').value;
            const confirmar = document.getElementById('confirmar').value;

            if (password !== confirmar) {
                e.preventDefault();
                alert('Las contraseñas no coinciden. Por favor, revisa los campos.');
            }
        });
    }
});


//MANEJO DEL ENVIO DE LOS REGISTROS DE USUARIOS
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formRegistro');
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const data = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };
  
      fetch('https://backend-production-3cda.up.railway.app/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(result => {
        console.log('Usuario registrado:', result);
      })
      .catch(error => {
        console.error('Error al registrar:', error);
      });
    });
  });
*/

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formRegistro');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const password = document.getElementById('password').value;
      const confirmar = document.getElementById('confirmar').value;

      if (password !== confirmar) {
        alert('Las contraseñas no coinciden. Por favor, revisa los campos.');
        return;
      }

      const data = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: password
      };

      fetch('https://backend-production-3cda.up.railway.app/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => response.json())
        .then(result => {
          console.log('Usuario registrado:', result);
          alert('Registro exitoso!');
        })
        .catch(error => {
          console.error('Error al registrar:', error);
          alert('Hubo un error al registrar al usuario.');
        });
    });
  }
});




  
  



