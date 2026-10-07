// frontend/src/modulo/reservas/componentePanelReservas.jsx (VERSIÓN FINAL COMPLETA)
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import ComponenteCargando from '../compartido/componenteCargando';

const ComponentePanelReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const [reporteData, setReporteData] = useState(null);
  const [filtrosReporte, setFiltrosReporte] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });
  const { token, usuario } = useAuthStore();
  const esAdmin = usuario?.rol === 'admin';

  // Estado para el formulario de reserva
  const [nuevaReserva, setNuevaReserva] = useState({
    cliente: {
      nombreCompleto: '',
      email: '',
      telefono: ''
    },
    clienteId: '',
    fechaEvento: '',
    productosReservados: [],
    direccionEntrega: {
      calle: '',
      numero: '',
      colonia: '',
      ciudad: '',
      codigoPostal: ''
    },
    telefonoContacto: '',
    notas: '',
    metodoPagoInicial: 'efectivo',
    referenciaPago: ''
  });

  const [productoTemp, setProductoTemp] = useState({
    productoId: '',
    cantidad: 1,
    tipoPrecio: 'menudeo'
  });

  // Estado para modo de selección de cliente
  const [modoCliente, setModoCliente] = useState('nuevo');
  const [clientesExistentes, setClientesExistentes] = useState([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  useEffect(() => {
    if (esAdmin) {
      cargarReservas();
      cargarProductos();
      cargarClientesExistentes();
    }
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reservas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReservas(data.reservas || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarClientesExistentes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClientesExistentes(data.usuarios || []);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/productos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProductos(data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const buscarOCrearCliente = async () => {
    setBuscandoCliente(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/buscar-crear-cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: nuevaReserva.cliente.email,
          nombreCompleto: nuevaReserva.cliente.nombreCompleto,
          telefono: nuevaReserva.cliente.telefono
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNuevaReserva({
          ...nuevaReserva,
          clienteId: data.cliente.id,
          telefonoContacto: data.cliente.telefono || nuevaReserva.cliente.telefono
        });
        return data.cliente.id;
      } else {
        const error = await response.json();
        alert('❌ Error al registrar cliente: ' + error.mensaje);
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al conectar con el servidor');
      return null;
    } finally {
      setBuscandoCliente(false);
    }
  };

  const agregarProductoAReserva = () => {
    if (!productoTemp.productoId || productoTemp.cantidad < 1) return;
    
    const producto = productos.find(p => p._id === productoTemp.productoId);
    if (!producto) return;
    
    const nuevoProducto = {
      productoId: producto._id,
      nombre: producto.nombre,
      cantidad: productoTemp.cantidad,
      tipoPrecio: productoTemp.tipoPrecio,
      precioUnitario: productoTemp.tipoPrecio === 'mayoreo' && producto.precioMayoreo ? producto.precioMayoreo : producto.precioUnitario
    };
    
    setNuevaReserva({
      ...nuevaReserva,
      productosReservados: [...nuevaReserva.productosReservados, nuevoProducto]
    });
    
    setProductoTemp({ productoId: '', cantidad: 1, tipoPrecio: 'menudeo' });
  };

  const eliminarProductoDeReserva = (index) => {
    const nuevosProductos = [...nuevaReserva.productosReservados];
    nuevosProductos.splice(index, 1);
    setNuevaReserva({ ...nuevaReserva, productosReservados: nuevosProductos });
  };

  const calcularTotalReserva = () => {
    const subtotal = nuevaReserva.productosReservados.reduce((sum, item) => {
      return sum + (item.precioUnitario * item.cantidad);
    }, 0);
    
    const cantidadTotal = nuevaReserva.productosReservados.reduce((sum, item) => sum + item.cantidad, 0);
    let porcentajeDescuento = 0;
    if (cantidadTotal >= 200) porcentajeDescuento = 15;
    else if (cantidadTotal >= 101) porcentajeDescuento = 10;
    else if (cantidadTotal >= 51) porcentajeDescuento = 5;
    
    const descuento = subtotal * (porcentajeDescuento / 100);
    const totalConDescuento = subtotal - descuento;
    const iva = totalConDescuento * 0.16;
    const total = totalConDescuento + iva;
    
    return { subtotal, descuento, iva, total, cantidadTotal, porcentajeDescuento };
  };

  const crearReserva = async (e) => {
    e.preventDefault();
    
    if (modoCliente === 'nuevo') {
      if (!nuevaReserva.cliente.nombreCompleto || !nuevaReserva.cliente.email) {
        alert('❌ Por favor, complete nombre y email del cliente');
        return;
      }
      
      const clienteId = await buscarOCrearCliente();
      if (!clienteId) return;
    } else {
      if (!nuevaReserva.clienteId) {
        alert('❌ Por favor, seleccione un cliente');
        return;
      }
    }
    
    const fechaMinima = new Date();
    fechaMinima.setDate(fechaMinima.getDate() + 30);
    const fechaEvento = new Date(nuevaReserva.fechaEvento);
    
    if (fechaEvento < fechaMinima) {
      alert('❌ La fecha del evento debe ser al menos 30 días después');
      return;
    }
    
    if (nuevaReserva.productosReservados.length === 0) {
      alert('❌ Debe agregar al menos un producto');
      return;
    }
    
    const datosEnvio = {
      clienteId: nuevaReserva.clienteId,
      fechaEvento: nuevaReserva.fechaEvento,
      productosReservados: nuevaReserva.productosReservados.map(p => ({
        productoId: p.productoId,
        cantidad: p.cantidad,
        tipoPrecio: p.tipoPrecio
      })),
      direccionEntrega: nuevaReserva.direccionEntrega,
      telefonoContacto: nuevaReserva.telefonoContacto || nuevaReserva.cliente.telefono,
      notas: nuevaReserva.notas,
      metodoPagoInicial: nuevaReserva.metodoPagoInicial,
      referenciaPago: nuevaReserva.referenciaPago
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosEnvio)
      });
      
      if (response.ok) {
        alert('✅ Reserva creada exitosamente');
        setMostrarFormulario(false);
        cargarReservas();
        resetFormulario();
      } else {
        const error = await response.json();
        alert('❌ Error al crear reserva: ' + error.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear reserva');
    }
  };

  const actualizarReserva = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/api/reservas/${reservaSeleccionada._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clienteId: nuevaReserva.clienteId,
          fechaEvento: nuevaReserva.fechaEvento,
          telefonoContacto: nuevaReserva.telefonoContacto,
          notas: nuevaReserva.notas,
          direccionEntrega: nuevaReserva.direccionEntrega
        })
      });
      
      if (response.ok) {
        alert('✅ Reserva actualizada exitosamente');
        setMostrarEdicion(false);
        cargarReservas();
      } else {
        const error = await response.json();
        alert('❌ Error al actualizar: ' + error.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar reserva');
    }
  };

  const resetFormulario = () => {
    setNuevaReserva({
      cliente: { nombreCompleto: '', email: '', telefono: '' },
      clienteId: '',
      fechaEvento: '',
      productosReservados: [],
      direccionEntrega: { calle: '', numero: '', colonia: '', ciudad: '', codigoPostal: '' },
      telefonoContacto: '',
      notas: '',
      metodoPagoInicial: 'efectivo',
      referenciaPago: ''
    });
    setModoCliente('nuevo');
  };

  const abrirEdicion = (reserva) => {
    setReservaSeleccionada(reserva);
    setNuevaReserva({
      ...nuevaReserva,
      clienteId: reserva.clienteId?._id || reserva.clienteId,
      fechaEvento: reserva.fechaEvento.split('T')[0],
      telefonoContacto: reserva.telefonoContacto || '',
      notas: reserva.notas || '',
      direccionEntrega: reserva.direccionEntrega || {
        calle: '', numero: '', colonia: '', ciudad: '', codigoPostal: ''
      },
      productosReservados: reserva.productosReservados || []
    });
    setMostrarEdicion(true);
  };

  const convertirAVenta = async (reservaId) => {
    if (!confirm('¿Confirmar conversión a venta? Se descontará el stock.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/reservas/${reservaId}/convertir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metodoPagoFinal: 'mixto',
          montoPagadoFinal: 0
        })
      });
      
      if (response.ok) {
        alert('✅ Reserva convertida a venta exitosamente');
        cargarReservas();
        setMostrarDetalle(false);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.mensaje);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al convertir a venta');
    }
  };

  const cambiarEstado = async (reservaId, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservas/${reservaId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      if (response.ok) {
        alert('✅ Estado actualizado');
        cargarReservas();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generarReporteReservas = async () => {
    setCargando(true);
    try {
      let url = 'http://localhost:5000/api/reservas/reporte?';
      if (filtrosReporte.fechaInicio) url += `fechaInicio=${filtrosReporte.fechaInicio}&`;
      if (filtrosReporte.fechaFin) url += `fechaFin=${filtrosReporte.fechaFin}&`;
      if (filtrosReporte.estado) url += `estado=${filtrosReporte.estado}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReporteData(data);
      descargarReporteCSV(data);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('❌ Error al generar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const descargarReporteCSV = (data) => {
    let csvContent = "Folio,Cliente,Email,Fecha Evento,Total,Estado\n";
    
    data.reservas.forEach(reserva => {
      csvContent += `"${reserva.folioReserva}","${reserva.clienteId?.nombreCompleto || 'N/A'}","${reserva.clienteId?.email || 'N/A'}","${new Date(reserva.fechaEvento).toLocaleDateString()}","${reserva.totalReserva}","${reserva.estado}"\n`;
    });
    
    csvContent += `\n📊 ESTADÍSTICAS\n`;
    csvContent += `Total Reservas,${data.estadisticas.totalReservas}\n`;
    csvContent += `Monto Total,$${data.estadisticas.totalMonto.toFixed(2)}\n`;
    csvContent += `\nReservas por Estado:\n`;
    csvContent += `Borrador,${data.estadisticas.reservasPorEstado.borrador}\n`;
    csvContent += `50% Pagado,${data.estadisticas.reservasPorEstado['50_pagado']}\n`;
    csvContent += `Confirmada Entrega,${data.estadisticas.reservasPorEstado.confirmada_entrega}\n`;
    csvContent += `Convertida a Venta,${data.estadisticas.reservasPorEstado.convertida_a_venta}\n`;
    csvContent += `Cancelada,${data.estadisticas.reservasPorEstado.cancelada}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_reservas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'borrador': 'bg-gray-100 text-gray-700',
      '50_pagado': 'bg-yellow-100 text-yellow-700',
      'confirmada_entrega': 'bg-blue-100 text-blue-700',
      'convertida_a_venta': 'bg-green-100 text-green-700',
      'cancelada': 'bg-red-100 text-red-700'
    };
    return badges[estado] || 'bg-gray-100 text-gray-700';
  };

  if (!esAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-700">⚠️ Solo los administradores pueden gestionar reservas.</p>
        </div>
      </div>
    );
  }

  if (cargando) return <ComponenteCargando />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-vino">Gestión de Reservas</h1>
        <div className="flex gap-3">
          <button onClick={() => setMostrarReporte(true)} className="btn-secondary">
            📊 Reporte de Reservas
          </button>
          <button onClick={() => setMostrarFormulario(true)} className="btn-primary">
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-celeste text-white">
            <tr>
              <th className="p-3 text-left">Folio</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Fecha Evento</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(reserva => (
              <tr key={reserva._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{reserva.folioReserva}</td>
                <td className="p-3">{reserva.clienteId?.nombreCompleto || 'N/A'}</td>
                <td className="p-3">{new Date(reserva.fechaEvento).toLocaleDateString()}</td>
                <td className="p-3 text-right font-bold">${reserva.totalReserva.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reserva.estado)}`}>
                    {reserva.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setReservaSeleccionada(reserva);
                      setMostrarDetalle(true);
                    }}
                    className="text-celeste hover:underline mr-2"
                  >
                    Ver
                  </button>
                  {reserva.estado !== 'convertida_a_venta' && reserva.estado !== 'cancelada' && (
                    <button
                      onClick={() => abrirEdicion(reserva)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Editar
                    </button>
                  )}
                  {reserva.estado === '50_pagado' && (
                    <button
                      onClick={() => convertirAVenta(reserva._id)}
                      className="text-green-600 hover:underline"
                    >
                      Convertir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {mostrarDetalle && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-vino mb-4">Detalle de Reserva</h2>
            
            <div className="space-y-3 mb-4">
              <p><strong>Folio:</strong> {reservaSeleccionada.folioReserva}</p>
              <p><strong>Cliente:</strong> {reservaSeleccionada.clienteId?.nombreCompleto}</p>
              <p><strong>Email:</strong> {reservaSeleccionada.clienteId?.email}</p>
              <p><strong>Teléfono:</strong> {reservaSeleccionada.telefonoContacto}</p>
              <p><strong>Fecha Evento:</strong> {new Date(reservaSeleccionada.fechaEvento).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {reservaSeleccionada.estado}</p>
              
              <div className="border-t pt-3">
                <h3 className="font-bold mb-2">Productos:</h3>
                {reservaSeleccionada.productosReservados.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>{item.nombre} x {item.cantidad}</span>
                    <span>${(item.precioUnitarioReserva * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <p><strong>Subtotal:</strong> ${reservaSeleccionada.subtotalReserva.toFixed(2)}</p>
                <p><strong>IVA:</strong> ${reservaSeleccionada.ivaReserva.toFixed(2)}</p>
                <p className="text-xl font-bold"><strong>Total:</strong> ${reservaSeleccionada.totalReserva.toFixed(2)}</p>
                <p><strong>Pagado:</strong> ${reservaSeleccionada.montoPagadoInicial.toFixed(2)}</p>
                <p><strong>Restante:</strong> ${reservaSeleccionada.montoRestante.toFixed(2)}</p>
              </div>
              
              {reservaSeleccionada.notas && (
                <div className="border-t pt-3">
                  <p><strong>Notas:</strong> {reservaSeleccionada.notas}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarDetalle(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cerrar
              </button>
              {reservaSeleccionada.estado !== 'cancelada' && reservaSeleccionada.estado !== 'convertida_a_venta' && (
                <button
                  onClick={() => cambiarEstado(reservaSeleccionada._id, 'cancelada')}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Cancelar Reserva
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario de nueva reserva */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-vino mb-4">Nueva Reserva</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">¿Cómo deseas agregar al cliente?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModoCliente('nuevo')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    modoCliente === 'nuevo' 
                      ? 'bg-celeste text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✏️ Cliente Nuevo
                </button>
                <button
                  type="button"
                  onClick={() => setModoCliente('existente')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    modoCliente === 'existente' 
                      ? 'bg-celeste text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📋 Cliente Existente
                </button>
              </div>
            </div>
            
            <form onSubmit={crearReserva}>
              {modoCliente === 'nuevo' ? (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-celeste mb-3">Datos del Nuevo Cliente</h3>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={nuevaReserva.cliente.nombreCompleto}
                      onChange={(e) => setNuevaReserva({
                        ...nuevaReserva,
                        cliente: { ...nuevaReserva.cliente, nombreCompleto: e.target.value }
                      })}
                      className="input-field"
                      required
                      placeholder="Ej: Juan Pérez González"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={nuevaReserva.cliente.email}
                      onChange={(e) => setNuevaReserva({
                        ...nuevaReserva,
                        cliente: { ...nuevaReserva.cliente, email: e.target.value }
                      })}
                      className="input-field"
                      required
                      placeholder="cliente@ejemplo.com"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={nuevaReserva.cliente.telefono}
                      onChange={(e) => setNuevaReserva({
                        ...nuevaReserva,
                        cliente: { ...nuevaReserva.cliente, telefono: e.target.value }
                      })}
                      className="input-field"
                      placeholder="Ej: 555-1234567"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-3">Seleccionar Cliente Existente</h3>
                  <select
                    value={nuevaReserva.clienteId}
                    onChange={(e) => setNuevaReserva({...nuevaReserva, clienteId: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientesExistentes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nombreCompleto} - {cliente.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Fecha del Evento *</label>
                <input
                  type="date"
                  value={nuevaReserva.fechaEvento}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, fechaEvento: e.target.value})}
                  className="input-field"
                  required
                  min={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">La fecha debe ser al menos 30 días después</p>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={nuevaReserva.telefonoContacto}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, telefonoContacto: e.target.value})}
                  className="input-field"
                  placeholder="Opcional - si es diferente al teléfono del cliente"
                />
              </div>
              
              <div className="border-t pt-3 mb-3">
                <h3 className="font-bold mb-2">Productos a Reservar</h3>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={productoTemp.productoId}
                    onChange={(e) => setProductoTemp({...productoTemp, productoId: e.target.value})}
                    className="input-field col-span-1"
                  >
                    <option value="">Producto</option>
                    {productos.map(p => (
                      <option key={p._id} value={p._id}>{p.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={productoTemp.cantidad}
                    onChange={(e) => setProductoTemp({...productoTemp, cantidad: parseInt(e.target.value)})}
                    className="input-field"
                    min="1"
                    placeholder="Cantidad"
                  />
                  <button
                    type="button"
                    onClick={agregarProductoAReserva}
                    className="btn-primary"
                  >
                    Agregar
                  </button>
                </div>
                
                {nuevaReserva.productosReservados.length > 0 && (
                  <div className="mt-3">
                    {nuevaReserva.productosReservados.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-1">
                        <span>{item.nombre} x {item.cantidad}</span>
                        <span>${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => eliminarProductoDeReserva(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {(() => {
                      const { subtotal, descuento, iva, total, cantidadTotal, porcentajeDescuento } = calcularTotalReserva();
                      return (
                        <div className="mt-3 p-3 bg-celeste bg-opacity-10 rounded">
                          <p><strong>Cantidad total:</strong> {cantidadTotal} unidades</p>
                          <p><strong>Descuento aplicado:</strong> {porcentajeDescuento}% (${descuento.toFixed(2)})</p>
                          <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                          <p><strong>IVA (16%):</strong> ${iva.toFixed(2)}</p>
                          <p className="font-bold text-lg"><strong>Total a pagar:</strong> ${total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-1">💰 Pago inicial requerido: 50% (${(total * 0.5).toFixed(2)})</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Notas Adicionales</label>
                <textarea
                  value={nuevaReserva.notas}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, notas: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Instrucciones especiales, requisitos, etc."
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-300 py-2 rounded">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary" disabled={buscandoCliente}>
                  {buscandoCliente ? 'Registrando cliente...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {mostrarEdicion && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-vino mb-4">Editar Reserva</h2>
            
            <form onSubmit={actualizarReserva}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Cliente</label>
                <select
                  value={nuevaReserva.clienteId}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, clienteId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientesExistentes.map(cliente => (
                    <option key={cliente._id} value={cliente._id}>
                      {cliente.nombreCompleto} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Fecha del Evento</label>
                <input
                  type="date"
                  value={nuevaReserva.fechaEvento}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, fechaEvento: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={nuevaReserva.telefonoContacto}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, telefonoContacto: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Notas</label>
                <textarea
                  value={nuevaReserva.notas}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, notas: e.target.value})}
                  className="input-field"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setMostrarEdicion(false)} className="flex-1 bg-gray-300 py-2 rounded">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de reporte */}
      {mostrarReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-vino mb-4">Reporte de Reservas</h2>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filtrosReporte.fechaInicio}
                onChange={(e) => setFiltrosReporte({...filtrosReporte, fechaInicio: e.target.value})}
                className="input-field"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filtrosReporte.fechaFin}
                onChange={(e) => setFiltrosReporte({...filtrosReporte, fechaFin: e.target.value})}
                className="input-field"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Estado</label>
              <select
                value={filtrosReporte.estado}
                onChange={(e) => setFiltrosReporte({...filtrosReporte, estado: e.target.value})}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="50_pagado">50% Pagado</option>
                <option value="confirmada_entrega">Confirmada Entrega</option>
                <option value="convertida_a_venta">Convertida a Venta</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setMostrarReporte(false)} className="flex-1 bg-gray-300 py-2 rounded">
                Cancelar
              </button>
              <button onClick={generarReporteReservas} className="flex-1 btn-primary">
                Generar Reporte CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentePanelReservas;