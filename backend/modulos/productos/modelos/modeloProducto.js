// backend/modulos/productos/modelos/modeloProducto.js (ACTUALIZADO con tipoVenta)
import mongoose from 'mongoose';

const esquemaProducto = new mongoose.Schema({
  codigoBarras: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    index: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    enum: ['whisky', 'tequila', 'vodka', 'ron', 'cerveza', 'vino', 'licor', 'otro'],
    index: true
  },
  tipoVenta: {
    type: String,
    enum: ['unidad', 'pack', 'ambos'],
    default: 'unidad',
    required: true
  },
  unidadesPorPack: {
    type: Number,
    default: 1,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  precioPack: {
    type: Number,
    min: [0, 'El precio no puede ser negativo'],
    default: null
  },
  precioMayoreo: {
    type: Number,
    min: [0, 'El precio no puede ser negativo'],
    default: null
  },
  costoUnitario: {
    type: Number,
    required: true,
    min: [0, 'El costo no puede ser negativo']
  },
  stockVitrina: {
    type: Number,
    required: true,
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  stockAlmacen: {
    type: Number,
    required: true,
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  stockMinimoVitrina: {
    type: Number,
    default: 5,
    min: 0
  },
  unidadMedida: {
    type: String,
    default: 'pieza'
  },
  unidadCaja: {
    type: Number,
    default: 12,
    min: 1
  },
  porcentajeIva: {
    type: Number,
    default: 16,
    min: 0,
    max: 100
  },
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
  imagenUrl: {
    type: String,
    trim: true
  },
  proveedor: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices
esquemaProducto.index({ nombre: 'text', descripcion: 'text' });
esquemaProducto.index({ categoria: 1, activo: 1 });
esquemaProducto.index({ stockVitrina: 1, stockMinimoVitrina: 1 });

// Método para verificar stock en vitrina
esquemaProducto.methods.verificarStock = function(cantidadSolicitada) {
  return this.stockVitrina >= cantidadSolicitada;
};

// Método para verificar stock en almacén
esquemaProducto.methods.verificarStockAlmacen = function(cantidadSolicitada) {
  return this.stockAlmacen >= cantidadSolicitada;
};

// Método para reducir stock vitrina
esquemaProducto.methods.reducirStock = async function(cantidad) {
  if (!this.verificarStock(cantidad)) {
    throw new Error(`Stock insuficiente en vitrina para ${this.nombre}. Disponible: ${this.stockVitrina}`);
  }
  this.stockVitrina -= cantidad;
  
  if (this.stockVitrina <= this.stockMinimoVitrina) {
    console.log(`⚠️ ALERTA: Stock bajo en vitrina para ${this.nombre}. Actual: ${this.stockVitrina}, Mínimo: ${this.stockMinimoVitrina}`);
  }
  
  await this.save();
  return true;
};

// Método para reducir stock almacén
esquemaProducto.methods.reducirStockAlmacen = async function(cantidad) {
  if (!this.verificarStockAlmacen(cantidad)) {
    throw new Error(`Stock insuficiente en almacén para ${this.nombre}. Disponible: ${this.stockAlmacen}`);
  }
  this.stockAlmacen -= cantidad;
  await this.save();
  return true;
};

// Método para aumentar stock vitrina
esquemaProducto.methods.aumentarStockVitrina = async function(cantidad) {
  this.stockVitrina += cantidad;
  await this.save();
  return true;
};

// Método para aumentar stock almacén
esquemaProducto.methods.aumentarStockAlmacen = async function(cantidad) {
  this.stockAlmacen += cantidad;
  await this.save();
  return true;
};

// Método para reabastecer vitrina desde almacén
esquemaProducto.methods.reabastecerVitrina = async function(cantidad) {
  if (!this.verificarStockAlmacen(cantidad)) {
    throw new Error(`Stock insuficiente en almacén. Disponible: ${this.stockAlmacen}`);
  }
  this.stockAlmacen -= cantidad;
  this.stockVitrina += cantidad;
  await this.save();
  return true;
};

// Obtener stock total
esquemaProducto.methods.obtenerStockTotal = function() {
  return this.stockVitrina + this.stockAlmacen;
};

// Obtener precio según tipo de compra
esquemaProducto.methods.obtenerPrecio = function(tipo = 'menudeo', cantidad = 1) {
  if (tipo === 'pack' && this.precioPack && this.tipoVenta !== 'unidad') {
    return this.precioPack;
  }
  if (tipo === 'mayoreo' && this.precioMayoreo) {
    return this.precioMayoreo;
  }
  return this.precioUnitario;
};

// Obtener el nombre con el tipo
esquemaProducto.methods.getNombreConTipo = function(tipo = 'unidad') {
  if (tipo === 'pack' && this.tipoVenta !== 'unidad' && this.unidadesPorPack > 1) {
    return `${this.nombre} (Pack ${this.unidadesPorPack} uds)`;
  }
  return this.nombre;
};

const ModeloProducto = mongoose.model('Producto', esquemaProducto);
export default ModeloProducto;