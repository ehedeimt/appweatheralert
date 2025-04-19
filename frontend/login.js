document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Credenciales incorrectas.');
          }
  
          const data = await response.json();
          console.log('Usuario logueado:', data);
  
          alert('✅ Sesión iniciada correctamente.');
          
          // Redireccionar al dashboard o home
          window.location.href = '/dashboard.html';
        } catch (error) {
          console.error('Error al iniciar sesión:', error);
          alert(`❌ Error al iniciar sesión: ${error.message}`);
        }
      });
    }
  });
  