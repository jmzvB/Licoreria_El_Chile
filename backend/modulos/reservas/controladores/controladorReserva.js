// backend/modulos/reservas/controladores/controladorReserva.js (NUEVO ARCHIVO)
import ModeloReserva from '../modelos/modeloReserva.js';
import ModeloProducto from '../../productos/modelos/modeloProducto.js';
import ModeloUsuario from '../../autenticacion/modelos/modeloUsuario.js';
import ModeloVenta from '../../ventas/modelos/modeloVenta.js';

// Función para calcular descuento progresivo
const calcularDescuentoProgresivo = (cantidadTotal) => {
  if (cantidadTotal >= 200) return 15;
  if (cantidadTotal >= 101) return 10;
  if (cantidadTotal >= 51) return 5;
  return 0;
};

export const crearReserva = async (req, res) => {
  try {
    const {
      clienteId,
      fechaEvento,
      productosReservados,
      direccionEntrega,
      telefonoContacto,
      notas,
      metodoPagoInicial,
      referenciaPago
    } = req.body;

    // Validar fecha (mínimo 30 días después)
    const fechaMinima = new Date();
    fechaMinima.setDate(fechaMinima.getDate() + 30);
    const fechaEventoDate = new Date(fechaEvento);
    
    if (fechaEventoDate < fechaMinima) {
      return res.status(400).json({
        error: 'fecha_invalida',
        mensaje: 'La fecha del evento debe ser al menos 30 días después de la fecha actual'
      });
    }

    // Verificar cliente
    const cliente = await ModeloUsuario.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'cliente_no_encontrado', mensaje: 'Cliente no encontrado' });
    }

    // Calcular subtotal y cantidad total
    let subtotalReserva = 0;
    let cantidadTotal = 0;
    const productosDetalle = [];

    for (const item of productosReservados) {
      const producto = await ModeloProducto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: 'producto_no_encontrado', mensaje: `Producto no encontrado` });
      }

      const precioUnitario = item.tipoPrecio === 'mayoreo' && producto.precioMayoreo
        ? producto.precioMayoreo
        : producto.precioUnitario;
      
      const subtotalProducto = precioUnitario * item.cantidad;
      subtotalReserva += subtotalProducto;
      cantidadTotal += item.cantidad;

      productosDetalle.push({
        productoId: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitarioReserva: precioUnitario,
        subtotalProducto: subtotalProducto,
        tipoPrecio: item.tipoPrecio || 'menudeo'
      });
    }

    // Calcular descuento
    const porcentajeDescuento = calcularDescuentoProgresivo(cantidadTotal);
    const descuento = subtotalReserva * (porcentajeDescuento / 100);
    const totalConDescuento = subtotalReserva - descuento;
    const ivaReserva = totalConDescuento * 0.16;
    const totalReserva = totalConDescuento + ivaReserva;
    
    // Pago inicial (50%)
    const porcentajePagoInicial = 50;
    const montoPagadoInicial = totalReserva * (porcentajePagoInicial / 100);
    const montoRestante = totalReserva - montoPagadoInicial;

    // Crear reserva
    const reserva = new ModeloReserva({
      clienteId,
      fechaEvento: fechaEventoDate,
      productosReservados: productosDetalle,
      subtotalReserva,
      ivaReserva,
      totalReserva,
      porcentajePagoInicial,
      montoPagadoInicial,
      montoRestante,
      estado: montoPagadoInicial > 0 ? '50_pagado' : 'borrador',
      direccionEntrega,
      telefonoContacto,
      notas,
      pagoInicial: metodoPagoInicial ? {
        metodoPago: metodoPagoInicial,
        referenciaPago: referenciaPago,
        fechaPago: new Date(),
      } : undefined,
      tipoReserva: 'evento'
    });

    await reserva.save();

    res.status(201).json({
      mensaje: 'Reserva creada exitosamente',
      reserva
    });

  } catch (error) {
    console.error('Error crear reserva:', error);
    res.status(500).json({ error: 'error_crear_reserva', mensaje: error.message });
  }
};

export const obtenerReservas = async (req, res) => {
  try {
    const { estado, clienteId, pagina = 1, limite = 10 } = req.query;
    const filtro = {};
    
    if (estado) filtro.estado = estado;
    if (clienteId) filtro.clienteId = clienteId;
    
    // Si es admin, ve todas; si es cliente, solo las suyas
    if (req.usuario.rol === 'clienteAnticipado') {
      filtro.clienteId = req.usuario.id;
    }
    
    const reservas = await ModeloReserva.find(filtro)
      .populate('clienteId', 'nombreCompleto email telefono')
      .populate('productosReservados.productoId', 'nombre precioUnitario')
      .sort({ createdAt: -1 })
      .limit(limite * 1)
      .skip((pagina - 1) * limite);
    
    const total = await ModeloReserva.countDocuments(filtro);
    
    res.json({
      reservas,
      paginaActual: parseInt(pagina),
      totalPaginas: Math.ceil(total / limite),
      totalReservas: total
    });
  } catch (error) {
    res.status(500).json({ error: 'error_obtener_reservas', mensaje: error.message });
  }
};

export const obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await ModeloReserva.findById(req.params.id)
      .populate('clienteId', 'nombreCompleto email telefono')
      .populate('productosReservados.productoId', 'nombre precioUnitario precioMayoreo');
    
    if (!reserva) {
      return res.status(404).json({ error: 'reserva_no_encontrada', mensaje: 'Reserva no encontrada' });
    }
    
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'error_obtener_reserva', mensaje: error.message });
  }
};

export const actualizarReserva = async (req, res) => {
  try {
    const reserva = await ModeloReserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reserva) {
      return res.status(404).json({ error: 'reserva_no_encontrada', mensaje: 'Reserva no encontrada' });
    }
    
    res.json({ mensaje: 'Reserva actualizada exitosamente', reserva });
  } catch (error) {
    res.status(400).json({ error: 'error_actualizar_reserva', mensaje: error.message });
  }
};

export const cambiarEstadoReserva = async (req, res) => {
  try {
    const { estado } = req.body;
    const reserva = await ModeloReserva.findById(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'reserva_no_encontrada', mensaje: 'Reserva no encontrada' });
    }
    
    reserva.estado = estado;
    await reserva.save();
    
    res.json({ mensaje: 'Estado actualizado exitosamente', reserva });
  } catch (error) {
    res.status(400).json({ error: 'error_cambiar_estado', mensaje: error.message });
  }
};

export const convertirReservaAVenta = async (req, res) => {
  try {
    const reserva = await ModeloReserva.findById(req.params.id)
      .populate('productosReservados.productoId');
    
    if (!reserva) {
      return res.status(404).json({ error: 'reserva_no_encontrada', mensaje: 'Reserva no encontrada' });
    }
    
    if (reserva.estado === 'convertida_a_venta') {
      return res.status(400).json({ error: 'ya_convertida', mensaje: 'Esta reserva ya fue convertida a venta' });
    }
    
    const { metodoPagoFinal, montoPagadoFinal, referenciaPagoFinal } = req.body;
    
    // Crear venta a partir de la reserva
    const productosVenta = reserva.productosReservados.map(item => ({
      productoId: item.productoId._id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitarioReserva,
      precioTotal: item.subtotalProducto,
      ivaProducto: item.subtotalProducto * 0.16
    }));
    
    const venta = new ModeloVenta({
      folio: await ModeloVenta.generarFolio(),
      productos: productosVenta,
      subtotal: reserva.subtotalReserva,
      ivaTotal: reserva.ivaReserva,
      descuentoTotal: 0,
      total: reserva.totalReserva,
      metodoPago: metodoPagoFinal || 'mixto',
      detallesPago: {
        mixto: {
          montoEfectivo: montoPagadoFinal || reserva.montoRestante,
          referenciaQr: referenciaPagoFinal
        }
      },
      vendedorId: req.usuario.id,
      clienteAnticipadoId: reserva.clienteId,
      reservaOrigenId: reserva._id,
      estado: 'completada'
    });
    
    await venta.save();
    
    // Actualizar stock (reducir de vitrina)
    for (const item of reserva.productosReservados) {
      const producto = await ModeloProducto.findById(item.productoId._id);
      await producto.reducirStock(item.cantidad);
    }
    
    // Actualizar reserva
    reserva.estado = 'convertida_a_venta';
    reserva.ventaGeneradaId = venta._id;
    reserva.pagoFinal = {
      metodoPago: metodoPagoFinal,
      referenciaPago: referenciaPagoFinal,
      fechaPago: new Date(),
      montoPagado: montoPagadoFinal || reserva.montoRestante
    };
    reserva.montoRestante = 0;
    
    await reserva.save();
    
    res.json({
      mensaje: 'Reserva convertida a venta exitosamente',
      ventaId: venta._id,
      ventaFolio: venta.folio
    });
    
  } catch (error) {
    console.error('Error convertir reserva:', error);
    res.status(500).json({ error: 'error_convertir_reserva', mensaje: error.message });
  }
};

// backend/modulos/reservas/controladores/controladorReserva.js
// Agrega esta función al final del archivo

export const obtenerReporteReservas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, estado } = req.query;
    const filtro = {};
    
    if (fechaInicio || fechaFin) {
      filtro.fechaReserva = {};
      if (fechaInicio) filtro.fechaReserva.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaReserva.$lte = new Date(fechaFin);
    }
    
    if (estado) filtro.estado = estado;
    
    const reservas = await ModeloReserva.find(filtro)
      .populate('clienteId', 'nombreCompleto email telefono')
      .populate('productosReservados.productoId', 'nombre')
      .sort({ createdAt: -1 });
    
    // Calcular estadísticas
    const estadisticas = {
      totalReservas: reservas.length,
      totalMonto: reservas.reduce((sum, r) => sum + r.totalReserva, 0),
      reservasPorEstado: {
        borrador: reservas.filter(r => r.estado === 'borrador').length,
        '50_pagado': reservas.filter(r => r.estado === '50_pagado').length,
        confirmada_entrega: reservas.filter(r => r.estado === 'confirmada_entrega').length,
        convertida_a_venta: reservas.filter(r => r.estado === 'convertida_a_venta').length,
        cancelada: reservas.filter(r => r.estado === 'cancelada').length
      },
      productosMasReservados: []
    };
    
    // Calcular productos más reservados
    const productosCount = {};
    reservas.forEach(reserva => {
      reserva.productosReservados.forEach(producto => {
        const nombre = producto.nombre;
        if (!productosCount[nombre]) {
          productosCount[nombre] = 0;
        }
        productosCount[nombre] += producto.cantidad;
      });
    });
    
    estadisticas.productosMasReservados = Object.entries(productosCount)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
    
    res.json({
      reservas,
      estadisticas,
      totalRegistros: reservas.length
    });
    
  } catch (error) {
    console.error('Error obtener reporte reservas:', error);
    res.status(500).json({ error: 'error_obtener_reporte', mensaje: error.message });
  }
};