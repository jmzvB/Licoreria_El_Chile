// backend/modulos/reservas/modelos/modeloReserva.js (CORREGIDO)
import mongoose from 'mongoose';

const esquemaReserva = new mongoose.Schema({
  folioReserva: {
    type: String,
    unique: true,
    sparse: true  // Cambiar de required: true a sparse para permitir generación automática
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  tipoReserva: {
    type: String,
    enum: ['evento', 'mayoreo'],
    default: 'evento'
  },
  fechaEvento: {
    type: Date,
    required: true,
    index: true
  },
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  productosReservados: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: String,
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitarioReserva: Number,
    subtotalProducto: Number,
    tipoPrecio: {
      type: String,
      enum: ['menudeo', 'mayoreo'],
      default: 'menudeo'
    }
  }],
  subtotalReserva: {
    type: Number,
    required: true
  },
  ivaReserva: {
    type: Number,
    required: true
  },
  totalReserva: {
    type: Number,
    required: true
  },
  porcentajePagoInicial: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  montoPagadoInicial: {
    type: Number,
    default: 0
  },
  montoRestante: {
    type: Number,
    default: 0
  },
  estado: {
    type: String,
    enum: ['borrador', '50_pagado', 'confirmada_entrega', 'convertida_a_venta', 'cancelada'],
    default: 'borrador',
    index: true
  },
  pagoInicial: {
    metodoPago: {
      type: String,
      enum: ['efectivo', 'qr', 'transferencia']
    },
    referenciaPago: String,
    fechaPago: Date,
    fotoComprobante: String
  },
  pagoFinal: {
    metodoPago: String,
    referenciaPago: String,
    fechaPago: Date,
    montoPagado: Number
  },
  ventaGeneradaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta'
  },
  notas: {
    type: String,
    trim: true
  },
  fechaLimitePagoFinal: {
    type: Date
  },
  direccionEntrega: {
    calle: String,
    numero: String,
    colonia: String,
    ciudad: String,
    codigoPostal: String,
    referencia: String
  },
  telefonoContacto: String
}, {
  timestamps: true
});

esquemaReserva.index({ clienteId: 1, estado: 1 });
esquemaReserva.index({ fechaEvento: 1, estado: 1 });
esquemaReserva.index({ folioReserva: 1 });
esquemaReserva.index({ tipoReserva: 1 });

// Función para generar folio
async function generarFolioReserva(tipoReserva) {
  const año = new Date().getFullYear();
  const prefijo = tipoReserva === 'mayoreo' ? 'MAY' : 'RES';
  
  // Buscar el último folio del año actual
  const ultimaReserva = await mongoose.model('Reserva').findOne({
    folioReserva: { $regex: `${prefijo}-${año}-`, $options: 'i' }
  }).sort({ folioReserva: -1 });
  
  let numero = 1;
  if (ultimaReserva && ultimaReserva.folioReserva) {
    const partes = ultimaReserva.folioReserva.split('-');
    if (partes.length === 3) {
      numero = parseInt(partes[2]) + 1;
    }
  }
  
  return `${prefijo}-${año}-${String(numero).padStart(5, '0')}`;
}

esquemaReserva.pre('save', async function(next) {
  // Solo generar folio si no existe
  if (!this.folioReserva) {
    try {
      this.folioReserva = await generarFolioReserva(this.tipoReserva);
      console.log(`📄 Folio generado: ${this.folioReserva}`);
    } catch (error) {
      console.error('Error generando folio:', error);
      // Fallback: generar un folio con timestamp
      this.folioReserva = `${this.tipoReserva === 'mayoreo' ? 'MAY' : 'RES'}-${Date.now()}`;
    }
  }
  
  // Calcular pagos si no están calculados
  if (this.isNew || this.isModified('totalReserva') || this.isModified('porcentajePagoInicial')) {
    this.montoPagadoInicial = this.totalReserva * (this.porcentajePagoInicial / 100);
    this.montoRestante = this.totalReserva - this.montoPagadoInicial;
  }
  
  next();
});

const ModeloReserva = mongoose.model('Reserva', esquemaReserva);
export default ModeloReserva;