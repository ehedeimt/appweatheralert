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

      console.log('🧪 Respuesta cruda del backend:', response);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error del backend:', error);
        throw new Error(error.msg || error.error || error.message || 'Error desconocido');
      }

      const data = await response.json();
      console.log('✅ Usuario autenticado:', data);

      // Guardo token y nombre del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuarioNombre', data.user.name);

      alert('Inicio de sesión exitoso. Bienvenido ' + data.user.name + '!');
      window.location.href = 'index.html';

    } catch (error) {
      console.error('❌ Error en el catch:', error);
      alert('Error al iniciar sesión: ' + error.message);
    }
  });
});