import mongoose from 'mongoose';

const esquemaReglaDescuento = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['x_mas_y_gratis', 'combo_cruzado', 'porcentaje_progresivo_por_paquete']
  },
  productoBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidadRequerida: {
    type: Number,
    required: true,
    min: 1
  },
  productoBeneficiado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  },
  unidadPaquete: {
    type: Number,
    min: 1
  },
  escalonPorcentaje: [{
    cantidadMinima: {
      type: Number,
      required: true
    },
    porcentaje: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaFin: {
    type: Date
  },
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  prioridad: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

esquemaReglaDescuento.pre('save', function(next) {
  if (this.tipo === 'x_mas_y_gratis' && !this.productoBeneficiado) {
    next(new Error('El tipo x_mas_y_gratis requiere un producto beneficiado'));
  }
  if (this.tipo === 'combo_cruzado' && (!this.productoBeneficiado || !this.unidadPaquete)) {
    next(new Error('El tipo combo_cruzado requiere producto beneficiado y unidad de paquete'));
  }
  if (this.tipo === 'porcentaje_progresivo_por_paquete' && (!this.escalonPorcentaje || this.escalonPorcentaje.length === 0)) {
    next(new Error('El tipo porcentaje_progresivo requiere escalones de porcentaje'));
  }
  next();
});

const ModeloReglaDescuento = mongoose.model('ReglaDescuento', esquemaReglaDescuento);
export default ModeloReglaDescuento;