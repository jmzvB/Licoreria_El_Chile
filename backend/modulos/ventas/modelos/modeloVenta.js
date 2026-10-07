import mongoose from 'mongoose';

const esquemaVenta = new mongoose.Schema({
  folio: {
    type: String,
    unique: true,
    sparse: true
  },
  fechaHora: {
    type: Date,
    default: Date.now,
    index: true
  },
  productos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: String,
    codigoBarras: String,
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: Number,
    precioTotal: Number,
    ivaProducto: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  ivaTotal: {
    type: Number,
    required: true,
    min: 0
  },
  descuentoTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  desgloseDescuentos: [{
    reglaId: mongoose.Schema.Types.ObjectId,
    nombre: String,
    tipo: String,
    descuentoAplicado: Number
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['efectivo', 'qr', 'mixto']
  },
  detallesPago: {
    efectivo: {
      montoRecibido: Number,
      cambioEntregado: Number
    },
    qr: {
      referenciaTransaccion: String,
      fotoComprobante: String,
      fechaHoraPago: Date
    },
    mixto: {
      montoEfectivo: Number,
      montoQr: Number,
      referenciaQr: String
    }
  },
  vendedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  clienteAnticipadoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  reservaOrigenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reserva'
  },
  estado: {
    type: String,
    enum: ['completada', 'cancelada', 'pendiente_entrega'],
    default: 'completada'
  },
  notas: {
    type: String,
    trim: true
  },
  turnoId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Índices
esquemaVenta.index({ fechaHora: -1 });
esquemaVenta.index({ vendedorId: 1, fechaHora: -1 });
esquemaVenta.index({ turnoId: 1 });
esquemaVenta.index({ 'productos.productoId': 1 });
esquemaVenta.index({ folio: 1 });

// Función para generar folio (como función estática)
esquemaVenta.statics.generarFolio = async function() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const fechaStr = `${año}${mes}${dia}`;
  
  // Contar ventas del día
  const inicioDia = new Date(año, mes - 1, dia);
  const finDia = new Date(año, mes - 1, dia + 1);
  const count = await this.countDocuments({
    fechaHora: { $gte: inicioDia, $lt: finDia }
  });
  
  const consecutivo = String(count + 1).padStart(4, '0');
  return `VTA-${fechaStr}-${consecutivo}`;
};

const ModeloVenta = mongoose.model('Venta', esquemaVenta);
export default ModeloVenta;