const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Campos obligatorios.' });

  try {
    const user = await Usuario.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Usuario no encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign(
      { userId: user._id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error de servidor' });
  }
};
