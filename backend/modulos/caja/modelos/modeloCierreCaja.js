import mongoose from 'mongoose';

const esquemaCierreCaja = new mongoose.Schema({
  fechaCierre: {
    type: Date,
    default: Date.now,
    required: true
  },
  turno: {
    type: String,
    required: true,
    enum: ['matutino', 'vespertino', 'especial'],
    index: true
  },
  fechaInicioTurno: {
    type: Date,
    required: true
  },
  fechaFinTurno: {
    type: Date,
    required: true
  },
  vendedorPrincipalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  ventasDelTurno: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta'
  }],
  estadisticasVentas: {
    totalVentas: { type: Number, default: 0 },
    totalProductosVendidos: { type: Number, default: 0 },
    ventaPromedio: { type: Number, default: 0 },
    ventaMayor: { type: Number, default: 0 },
    ventaMenor: { type: Number, default: 0 }
  },
  desglosePagos: {
    efectivo: { type: Number, default: 0 },
    qr: { type: Number, default: 0 },
    mixto: { type: Number, default: 0 }
  },
  conteoFisicoEfectivo: {
    billetes1000: { type: Number, default: 0 },
    billetes500: { type: Number, default: 0 },
    billetes200: { type: Number, default: 0 },
    billetes100: { type: Number, default: 0 },
    billetes50: { type: Number, default: 0 },
    billetes20: { type: Number, default: 0 },
    monedas10: { type: Number, default: 0 },
    monedas5: { type: Number, default: 0 },
    monedas2: { type: Number, default: 0 },
    monedas1: { type: Number, default: 0 },
    totalEfectivoFisico: { type: Number, default: 0 }
  },
  totalSistemaEfectivo: {
    type: Number,
    default: 0
  },
  diferenciaEfectivo: {
    type: Number,
    default: 0
  },
  retirosParciales: [{
    monto: Number,
    motivo: String,
    fechaHora: Date,
    autorizadoPor: String
  }],
  observaciones: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: ['abierto', 'cerrado', 'auditado'],
    default: 'abierto'
  },
  cerradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
});

esquemaCierreCaja.index({ fechaCierre: -1, turno: 1 });
esquemaCierreCaja.index({ vendedorPrincipalId: 1, fechaCierre: -1 });

esquemaCierreCaja.methods.calcularTotalEfectivoFisico = function() {
  const denominaciones = {
    billetes1000: 1000,
    billetes500: 500,
    billetes200: 200,
    billetes100: 100,
    billetes50: 50,
    billetes20: 20,
    monedas10: 10,
    monedas5: 5,
    monedas2: 2,
    monedas1: 1
  };
  
  let total = 0;
  for (const [denom, valor] of Object.entries(denominaciones)) {
    total += (this.conteoFisicoEfectivo[denom] || 0) * valor;
  }
  
  this.conteoFisicoEfectivo.totalEfectivoFisico = total;
  return total;
};

const ModeloCierreCaja = mongoose.model('CierreCaja', esquemaCierreCaja);
export default ModeloCierreCaja;