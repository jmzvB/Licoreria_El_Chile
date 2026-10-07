// frontend/src/modulo/productos/componenteListaProductos.jsx (ACTUALIZADO - Moneda Bolivianos)
import React, { useState, useEffect } from 'react';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from './servicioProductos';
import { useAuthStore } from '../../store/useAuthStore';

const ComponenteListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [alertasStock, setAlertasStock] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const { usuario } = useAuthStore();
  const esAdmin = usuario?.rol === 'admin';
  
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'otro',
    tipoVenta: 'unidad',
    unidadesPorPack: 6,
    precioPack: null,
    precioUnitario: 0,
    precioMayoreo: null,
    costoUnitario: 0,
    stockVitrina: 0,
    stockAlmacen: 0,
    stockMinimoVitrina: 5,
    unidadCaja: 12
  });

  useEffect(() => {
    cargarProductos();
    if (esAdmin) {
      cargarAlertasStock();
    }
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos({ limite: 100 });
      setProductos(data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarAlertasStock = async () => {
    try {
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
        : '';
      const response = await fetch('http://localhost:5000/api/productos/alertas-stock', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAlertasStock(data.alertas || []);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const manejarImagenSeleccionada = (e, esEdicion = false) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenArchivo(archivo);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const manejarCrearProducto = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', nuevoProducto.nombre);
      formData.append('categoria', nuevoProducto.categoria);
      formData.append('tipoVenta', nuevoProducto.tipoVenta);
      formData.append('unidadesPorPack', nuevoProducto.unidadesPorPack);
      formData.append('precioUnitario', nuevoProducto.precioUnitario);
      formData.append('costoUnitario', nuevoProducto.costoUnitario);
      formData.append('stockVitrina', nuevoProducto.stockVitrina);
      formData.append('stockAlmacen', nuevoProducto.stockAlmacen);
      formData.append('stockMinimoVitrina', nuevoProducto.stockMinimoVitrina);
      formData.append('unidadCaja', nuevoProducto.unidadCaja);
      
      if (nuevoProducto.precioMayoreo) {
        formData.append('precioMayoreo', nuevoProducto.precioMayoreo);
      }
      
      if (nuevoProducto.precioPack) {
        formData.append('precioPack', nuevoProducto.precioPack);
      }
      
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      }
      
      await crearProducto(formData);
      setMostrarModal(false);
      setNuevoProducto({
        nombre: '',
        categoria: 'otro',
        tipoVenta: 'unidad',
        unidadesPorPack: 6,
        precioPack: null,
        precioUnitario: 0,
        precioMayoreo: null,
        costoUnitario: 0,
        stockVitrina: 0,
        stockAlmacen: 0,
        stockMinimoVitrina: 5,
        unidadCaja: 12
      });
      setImagenArchivo(null);
      setImagenPreview(null);
      cargarProductos();
      alert('✅ Producto creado exitosamente');
    } catch (error) {
      alert('❌ Error al crear producto: ' + (error.mensaje || error.error));
    }
  };

  const manejarEditarProducto = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', productoEditando.nombre);
      formData.append('categoria', productoEditando.categoria);
      formData.append('tipoVenta', productoEditando.tipoVenta);
      formData.append('unidadesPorPack', productoEditando.unidadesPorPack || 1);
      formData.append('precioUnitario', productoEditando.precioUnitario);
      formData.append('costoUnitario', productoEditando.costoUnitario);
      formData.append('stockVitrina', productoEditando.stockVitrina);
      formData.append('stockAlmacen', productoEditando.stockAlmacen);
      formData.append('stockMinimoVitrina', productoEditando.stockMinimoVitrina);
      formData.append('unidadCaja', productoEditando.unidadCaja);
      
      if (productoEditando.precioMayoreo) {
        formData.append('precioMayoreo', productoEditando.precioMayoreo);
      }
      
      if (productoEditando.precioPack) {
        formData.append('precioPack', productoEditando.precioPack);
      }
      
      if (imagenArchivo) {
        formData.append('imagen', imagenArchivo);
      }
      
      await actualizarProducto(productoEditando._id, formData);
      setMostrarModalEditar(false);
      setProductoEditando(null);
      setImagenArchivo(null);
      setImagenPreview(null);
      cargarProductos();
      alert('✅ Producto actualizado exitosamente');
    } catch (error) {
      alert('❌ Error al actualizar producto: ' + (error.mensaje || error.error));
    }
  };

  const manejarEliminarProducto = async () => {
    if (!productoAEliminar) return;
    
    try {
      await eliminarProducto(productoAEliminar._id);
      setMostrarConfirmacionEliminar(false);
      setProductoAEliminar(null);
      cargarProductos();
      alert('✅ Producto eliminado exitosamente');
    } catch (error) {
      alert('❌ Error al eliminar producto: ' + (error.mensaje || error.error));
    }
  };

  const manejarReabastecer = async (productoId, cantidad) => {
    try {
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
        : '';
      await fetch(`http://localhost:5000/api/productos/${productoId}/reabastecer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cantidad: parseInt(cantidad) })
      });
      cargarProductos();
      cargarAlertasStock();
      alert('✅ Vitrina reabastecida');
    } catch (error) {
      alert('❌ Error al reabastecer');
    }
  };

  const abrirModalEditar = (producto) => {
    setProductoEditando({ 
      ...producto,
      tipoVenta: producto.tipoVenta || 'unidad',
      unidadesPorPack: producto.unidadesPorPack || 1,
      precioPack: producto.precioPack || null
    });
    setImagenPreview(producto.imagenUrlCompleta);
    setImagenArchivo(null);
    setMostrarModalEditar(true);
  };

  const confirmarEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarConfirmacionEliminar(true);
  };

  const getIconoPorCategoria = (categoria) => {
    const iconos = {
      whisky: '🥃', tequila: '🥂', vodka: '🍸', ron: '🍹', 
      cerveza: '🍺', vino: '🍷', licor: '🍾', otro: '🥤'
    };
    return iconos[categoria] || '🍾';
  };

  const getTipoVentaTexto = (tipo, unidadesPack) => {
    if (tipo === 'pack') return `📦 Solo Pack (${unidadesPack} uds)`;
    if (tipo === 'ambos') return `🔄 Unidad o Pack (${unidadesPack} uds)`;
    return '📄 Solo Unidad';
  };

  return (
    <div className="container mx-auto p-6">
      {alertasStock.length > 0 && esAdmin && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-700 mb-2">⚠️ Alertas de Stock Bajo en Vitrina</h3>
          <div className="space-y-2">
            {alertasStock.map(alerta => (
              <div key={alerta.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <span className="font-semibold">{alerta.nombre}</span>
                  <span className="text-sm text-gray-500 ml-2">Stock: {alerta.stockVitrina} / Mínimo: {alerta.stockMinimo}</span>
                  <span className="text-sm text-celeste ml-2">Almacén: {alerta.stockAlmacen}</span>
                </div>
                <button
                  onClick={() => {
                    const cantidad = prompt(`¿Cuántas unidades mover del almacén a vitrina? (Disponible: ${alerta.stockAlmacen})`);
                    if (cantidad && parseInt(cantidad) > 0) {
                      manejarReabastecer(alerta.id, cantidad);
                    }
                  }}
                  className="btn-primary text-sm py-1 px-3"
                  disabled={alerta.stockAlmacen === 0}
                >
                  Reabastecer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-vino">Catálogo de Productos</h1>
        {esAdmin && (
          <button onClick={() => setMostrarModal(true)} className="btn-primary">
            + Nuevo Producto
          </button>
        )}
      </div>

      {cargando ? (
        <div className="text-center py-8">Cargando productos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map(producto => (
            <div key={producto._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center relative">
                {producto.imagenUrlCompleta ? (
                  <img 
                    src={producto.imagenUrlCompleta} 
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">{getIconoPorCategoria(producto.categoria)}</div>
                    <p className="text-gray-400 text-sm">Sin imagen</p>
                  </div>
                )}
                {/* Badge de tipo de venta */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  {getTipoVentaTexto(producto.tipoVenta, producto.unidadesPorPack)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{producto.nombre}</h3>
                <p className="text-sm text-gray-500 mb-2 capitalize">{producto.categoria}</p>
                
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-2xl font-bold text-celeste">Bs {producto.precioUnitario}</span>
                    <p className="text-xs text-gray-400">por unidad</p>
                  </div>
                  {producto.precioPack && (producto.tipoVenta === 'pack' || producto.tipoVenta === 'ambos') && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">Bs {producto.precioPack}</span>
                      <p className="text-xs text-gray-400">Pack {producto.unidadesPorPack} uds</p>
                    </div>
                  )}
                  {producto.precioMayoreo && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-vino">Mayoreo: Bs {producto.precioMayoreo}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Vitrina:</span>
                    <span className={`ml-2 font-semibold ${producto.stockVitrina <= producto.stockMinimoVitrina ? 'text-red-600' : 'text-green-600'}`}>
                      {producto.stockVitrina}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Almacén:</span>
                    <span className="ml-2 font-semibold">{producto.stockAlmacen}</span>
                  </div>
                </div>
                
                {esAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => abrirModalEditar(producto)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => confirmarEliminar(producto)}
                      className="px-3 bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear producto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-vino mb-4">Nuevo Producto</h2>
            <form onSubmit={manejarCrearProducto}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Imagen del Producto</label>
                {imagenPreview && (
                  <div className="mb-2">
                    <img src={imagenPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarImagenSeleccionada}
                  className="input-field"
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={nuevoProducto.nombre} 
                  onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} 
                  className="input-field" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Categoría *</label>
                <select 
                  value={nuevoProducto.categoria} 
                  onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} 
                  className="input-field"
                >
                  <option value="whisky">Whisky</option>
                  <option value="tequila">Tequila</option>
                  <option value="vodka">Vodka</option>
                  <option value="ron">Ron</option>
                  <option value="cerveza">Cerveza</option>
                  <option value="vino">Vino</option>
                  <option value="licor">Licor</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Tipo de Venta</label>
                <select
                  value={nuevoProducto.tipoVenta}
                  onChange={(e) => setNuevoProducto({...nuevoProducto, tipoVenta: e.target.value})}
                  className="input-field"
                >
                  <option value="unidad">Solo por Unidad</option>
                  <option value="pack">Solo por Pack</option>
                  <option value="ambos">Ambos (Unidad y Pack)</option>
                </select>
              </div>

              {(nuevoProducto.tipoVenta === 'pack' || nuevoProducto.tipoVenta === 'ambos') && (
                <>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Unidades por Pack</label>
                    <input
                      type="number"
                      value={nuevoProducto.unidadesPorPack}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, unidadesPorPack: parseInt(e.target.value)})}
                      className="input-field"
                      min="1"
                      placeholder="Ej: 6 para pack de 6 cervezas"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Precio por Pack</label>
                    <input
                      type="number"
                      value={nuevoProducto.precioPack || ''}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, precioPack: e.target.value ? parseFloat(e.target.value) : null})}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="Precio del pack completo"
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Precio Menudeo *</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.precioUnitario} 
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precioUnitario: parseFloat(e.target.value)})} 
                    className="input-field" 
                    required 
                    min="0" 
                    step="0.01" 
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Precio Mayoreo</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.precioMayoreo || ''} 
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precioMayoreo: e.target.value ? parseFloat(e.target.value) : null})} 
                    className="input-field" 
                    min="0" 
                    step="0.01" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Stock Vitrina *</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.stockVitrina} 
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stockVitrina: parseInt(e.target.value)})} 
                    className="input-field" 
                    required 
                    min="0" 
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Stock Almacén *</label>
                  <input 
                    type="number" 
                    value={nuevoProducto.stockAlmacen} 
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stockAlmacen: parseInt(e.target.value)})} 
                    className="input-field" 
                    required 
                    min="0" 
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Stock Mínimo Vitrina</label>
                <input 
                  type="number" 
                  value={nuevoProducto.stockMinimoVitrina} 
                  onChange={(e) => setNuevoProducto({...nuevoProducto, stockMinimoVitrina: parseInt(e.target.value)})} 
                  className="input-field" 
                  min="0" 
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 bg-gray-300 py-2 rounded">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar producto */}
      {mostrarModalEditar && productoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-vino mb-4">Editar Producto</h2>
            <form onSubmit={manejarEditarProducto}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Imagen del Producto</label>
                {imagenPreview && (
                  <div className="mb-2">
                    <img src={imagenPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => manejarImagenSeleccionada(e, true)}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío para mantener la imagen actual</p>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={productoEditando.nombre} 
                  onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})} 
                  className="input-field" 
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Categoría</label>
                <select 
                  value={productoEditando.categoria} 
                  onChange={(e) => setProductoEditando({...productoEditando, categoria: e.target.value})} 
                  className="input-field"
                >
                  <option value="whisky">Whisky</option>
                  <option value="tequila">Tequila</option>
                  <option value="vodka">Vodka</option>
                  <option value="ron">Ron</option>
                  <option value="cerveza">Cerveza</option>
                  <option value="vino">Vino</option>
                  <option value="licor">Licor</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Tipo de Venta</label>
                <select
                  value={productoEditando.tipoVenta || 'unidad'}
                  onChange={(e) => setProductoEditando({...productoEditando, tipoVenta: e.target.value})}
                  className="input-field"
                >
                  <option value="unidad">Solo por Unidad</option>
                  <option value="pack">Solo por Pack</option>
                  <option value="ambos">Ambos (Unidad y Pack)</option>
                </select>
              </div>

              {(productoEditando.tipoVenta === 'pack' || productoEditando.tipoVenta === 'ambos') && (
                <>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Unidades por Pack</label>
                    <input
                      type="number"
                      value={productoEditando.unidadesPorPack || 1}
                      onChange={(e) => setProductoEditando({...productoEditando, unidadesPorPack: parseInt(e.target.value)})}
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Precio por Pack</label>
                    <input
                      type="number"
                      value={productoEditando.precioPack || ''}
                      onChange={(e) => setProductoEditando({...productoEditando, precioPack: e.target.value ? parseFloat(e.target.value) : null})}
                      className="input-field"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Precio Menudeo</label>
                  <input 
                    type="number" 
                    value={productoEditando.precioUnitario} 
                    onChange={(e) => setProductoEditando({...productoEditando, precioUnitario: parseFloat(e.target.value)})} 
                    className="input-field" 
                    min="0" 
                    step="0.01" 
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Precio Mayoreo</label>
                  <input 
                    type="number" 
                    value={productoEditando.precioMayoreo || ''} 
                    onChange={(e) => setProductoEditando({...productoEditando, precioMayoreo: e.target.value ? parseFloat(e.target.value) : null})} 
                    className="input-field" 
                    min="0" 
                    step="0.01" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Stock Vitrina</label>
                  <input 
                    type="number" 
                    value={productoEditando.stockVitrina} 
                    onChange={(e) => setProductoEditando({...productoEditando, stockVitrina: parseInt(e.target.value)})} 
                    className="input-field" 
                    min="0" 
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Stock Almacén</label>
                  <input 
                    type="number" 
                    value={productoEditando.stockAlmacen} 
                    onChange={(e) => setProductoEditando({...productoEditando, stockAlmacen: parseInt(e.target.value)})} 
                    className="input-field" 
                    min="0" 
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setMostrarModalEditar(false)} className="flex-1 bg-gray-300 py-2 rounded">
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

      {/* Modal de confirmación para eliminar */}
      {mostrarConfirmacionEliminar && productoAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar el producto?
              </p>
              <p className="font-bold text-vino mb-6">{productoAEliminar.nombre}</p>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMostrarConfirmacionEliminar(false)} 
                  className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={manejarEliminarProducto} 
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponenteListaProductos;