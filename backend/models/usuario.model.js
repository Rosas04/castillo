const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['admin', 'empleado'],
    default: 'empleado'
  }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
