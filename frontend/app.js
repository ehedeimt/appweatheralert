document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
  
    const result = await response.json();
    
    if (response.ok) {
      alert('Registro exitoso');
    } else {
      alert('Error al registrar usuario: ' + result.error);
    }
  });  