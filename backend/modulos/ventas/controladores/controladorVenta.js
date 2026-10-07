import ModeloVenta from '../modelos/modeloVenta.js';
import ModeloProducto from '../../productos/modelos/modeloProducto.js';
import ModeloReglaDescuento from '../../descuentos/modelos/modeloReglaDescuento.js';
import MotorDescuentos from '../../descuentos/servicios/motorDescuentos.js';
import emisorEventos from '../../eventos/emisorEventos.js';

export const crearVenta = async (req, res) => {
  try {
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { productos, metodoPago, montoRecibido, clienteAnticipadoId, reservaOrigenId } = req.body;
    const vendedorId = req.usuario.id;
    
    // Validar que hay productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'sin_productos', mensaje: 'No hay productos en la venta' });
    }
    
    // Validar método de pago
    if (!metodoPago || !['efectivo', 'qr', 'mixto'].includes(metodoPago)) {
      return res.status(400).json({ error: 'metodo_pago_invalido', mensaje: 'Método de pago inválido' });
    }
    
    // Obtener productos con precios actualizados
    const productosConDetalle = [];
    let subtotal = 0;
    
    for (const item of productos) {
      const producto = await ModeloProducto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: 'producto_no_encontrado', mensaje: `Producto no encontrado` });
      }
      
      // Verificar stock en vitrina
      if (producto.stockVitrina < item.cantidad) {
        return res.status(400).json({ 
          error: 'stock_insuficiente', 
          mensaje: `Stock insuficiente para ${producto.nombre}. Disponible en vitrina: ${producto.stockVitrina}` 
        });
      }
      
      const precioTotal = producto.precioUnitario * item.cantidad;
      const ivaProducto = precioTotal * (producto.porcentajeIva / 100);
      
      productosConDetalle.push({
        productoId: producto._id,
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarras,
        cantidad: item.cantidad,
        precioUnitario: producto.precioUnitario,
        precioTotal: precioTotal,
        ivaProducto: ivaProducto
      });
      
      subtotal += precioTotal;
    }
    
    // Calcular descuentos
    const reglasActivas = await ModeloReglaDescuento.find({ 
      activo: true, 
      fechaInicio: { $lte: new Date() },
      $or: [{ fechaFin: null }, { fechaFin: { $gte: new Date() } }]
    });
    
    const { descuentoTotal, desgloseDescuentos } = MotorDescuentos.calcularDescuentos(reglasActivas, productosConDetalle);
    
    const ivaTotal = productosConDetalle.reduce((sum, p) => sum + p.ivaProducto, 0);
    const total = subtotal + ivaTotal - descuentoTotal;
    
    console.log(`💰 Total calculado: $${total}`);
    
    // Preparar detalles de pago
    let detallesPago = {};
    
    if (metodoPago === 'efectivo') {
      const monto = parseFloat(montoRecibido);
      if (isNaN(monto) || monto < total) {
        return res.status(400).json({ 
          error: 'monto_insuficiente', 
          mensaje: `El monto recibido ($${monto || 0}) es insuficiente. Total: $${total}` 
        });
      }
      const cambioEntregado = monto - total;
      detallesPago.efectivo = { montoRecibido: monto, cambioEntregado };
      console.log(`💵 Pago en efectivo: Recibido $${monto}, Cambio $${cambioEntregado}`);
      
    } else if (metodoPago === 'qr') {
      detallesPago.qr = {
        referenciaTransaccion: req.body.referenciaTransaccion || `QR-${Date.now()}`,
        fotoComprobante: req.body.fotoComprobante,
        fechaHoraPago: new Date()
      };
      console.log(`📱 Pago QR: ${detallesPago.qr.referenciaTransaccion}`);
      
    } else if (metodoPago === 'mixto') {
      detallesPago.mixto = {
        montoEfectivo: req.body.montoEfectivo || 0,
        montoQr: req.body.montoQr || 0,
        referenciaQr: req.body.referenciaQr || `QR-${Date.now()}`
      };
      console.log(`💳 Pago mixto: Efectivo $${detallesPago.mixto.montoEfectivo}, QR $${detallesPago.mixto.montoQr}`);
    }
    
    // Generar folio automáticamente
    const folio = await ModeloVenta.generarFolio();
    console.log(`📄 Folio generado: ${folio}`);
    
    const venta = new ModeloVenta({
      folio,
      productos: productosConDetalle,
      subtotal,
      ivaTotal,
      descuentoTotal,
      desgloseDescuentos,
      total,
      metodoPago,
      detallesPago,
      vendedorId,
      clienteAnticipadoId,
      reservaOrigenId,
      turnoId: req.body.turnoId || `TURNO-${Date.now()}`
    });
    
    await venta.save();
    console.log(`✅ Venta guardada con ID: ${venta._id}`);
    
    // Reducir stock de vitrina
    for (const item of productosConDetalle) {
      const producto = await ModeloProducto.findById(item.productoId);
      producto.stockVitrina -= item.cantidad;
      await producto.save();
      console.log(`📦 Stock actualizado: ${producto.nombre} - Vitrina: ${producto.stockVitrina}`);
    }
    
    // Emitir evento
    await emisorEventos.emitir('ventaConfirmada', { ventaId: venta._id, productos: productosConDetalle });
    
    res.status(201).json({ 
      mensaje: 'Venta registrada exitosamente', 
      venta: {
        id: venta._id,
        folio: venta.folio,
        total: venta.total,
        fechaHora: venta.fechaHora
      },
      cambio: metodoPago === 'efectivo' ? detallesPago.efectivo.cambioEntregado : null
    });
    
  } catch (error) {
    console.error('❌ Error en crearVenta:', error);
    res.status(500).json({ error: 'error_crear_venta', mensaje: error.message });
  }
};

export const obtenerVentas = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, fechaInicio, fechaFin, vendedorId } = req.query;
    const filtro = {};
    
    if (fechaInicio || fechaFin) {
      filtro.fechaHora = {};
      if (fechaInicio) filtro.fechaHora.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fechaHora.$lte = new Date(fechaFin);
    }
    
    if (vendedorId) filtro.vendedorId = vendedorId;
    if (req.usuario.rol === 'vendedor') filtro.vendedorId = req.usuario.id;
    
    const ventas = await ModeloVenta.find(filtro)
      .populate('vendedorId', 'nombreCompleto email')
      .populate('productos.productoId', 'nombre codigoBarras')
      .limit(limite * 1)
      .skip((pagina - 1) * limite)
      .sort({ fechaHora: -1 });
    
    const total = await ModeloVenta.countDocuments(filtro);
    
    res.json({
      ventas,
      paginaActual: parseInt(pagina),
      totalPaginas: Math.ceil(total / limite),
      totalVentas: total
    });
  } catch (error) {
    console.error('Error en obtenerVentas:', error);
    res.status(500).json({ error: 'error_obtener_ventas', mensaje: error.message });
  }
};