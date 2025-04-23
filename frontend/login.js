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
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
  
        const data = await response.json();
        alert('✅ Inicio de sesión exitoso. Bienvenido ' + data.user.name + '!');
        console.log('Usuario logueado:', data);
  

      } catch (error) {
        alert('❌ Error al iniciar sesión: ' + error.message);
      }
    });
  });
  