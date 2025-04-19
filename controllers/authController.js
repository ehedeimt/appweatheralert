exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado.' });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Contraseña incorrecta.' });
      }
  
      // Todo OK
      res.json({ message: 'Login exitoso', user: { name: user.name, email: user.email } });
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      res.status(500).json({ message: 'Error del servidor' });
    }
  };
  