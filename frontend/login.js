document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
      
        console.log('Respuesta del servidor:', response);
      
        if (!response.ok) {
          const error = await response.json();
          console.error('Error del servidor:', error);
          throw new Error(error.msg || error.message || 'Error desconocido');
        }
      
        const data = await response.json();
        alert('✅ Inicio de sesión exitoso. Bienvenido ' + data.user.name + '!');
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
      
      } catch (error) {
        alert('❌ Error al iniciar sesión: ' + error.message);
        console.error('Catch:', error);
      }
      
    });
  });
  