/*CÓDIGO PARA CONTROLAR QUE COINCIDAN LAS CONTRASEÑAS*/
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
  
  
  
  document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Usuario registrado:', data);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  });
  