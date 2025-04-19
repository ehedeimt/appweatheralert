// controllers/authController.js
const User = require('/models/User');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // suponiendo que usás Mongoose

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Aquí podrías generar un token, etc.
    res.json({ message: 'Login exitoso', user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};
