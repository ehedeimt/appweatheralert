  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
  
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        // Obtener valores
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmar = document.getElementById('confirmar').value;
  
        // Validar que las contraseñas coincidan
        if (password !== confirmar) {
          alert('❌ Las contraseñas no coinciden. Por favor, revisa los campos.');
          return;
        }
  
        try {
          const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          alert('✅ Usuario registrado con éxito. ¡Bienvenido!');
          console.log('Usuario registrado:', data);
  
          // Limpiar el formulario (opcional)
          form.reset();
        } catch (error) {
          console.error('Error al registrar usuario:', error);
          alert(`❌ El email facilitado ya exite en nuestra base de datos`);
        }
      });
    }
  });
  