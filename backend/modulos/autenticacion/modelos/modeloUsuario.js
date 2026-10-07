import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const esquemaUsuario = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  contrasenia: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true
  },
  rol: {
    type: String,
    enum: ['admin', 'vendedor', 'clienteAnticipado'],
    default: 'vendedor'
  },
  activo: {
    type: Boolean,
    default: true
  },
  telefono: {
    type: String,
    trim: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date
  },
  codigoInvitacion: {
    type: String,
    unique: true,
    sparse: true
  },
  limiteReservasActivas: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

esquemaUsuario.index({ email: 1 });
esquemaUsuario.index({ rol: 1, activo: 1 });
esquemaUsuario.index({ codigoInvitacion: 1 });

esquemaUsuario.pre('save', async function(next) {
  if (!this.isModified('contrasenia')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contrasenia = await bcrypt.hash(this.contrasenia, salt);
  next();
});

esquemaUsuario.methods.compararContrasenia = async function(contraseniaIngresada) {
  return await bcrypt.compare(contraseniaIngresada, this.contrasenia);
};

const ModeloUsuario = mongoose.model('Usuario', esquemaUsuario);
export default ModeloUsuario;