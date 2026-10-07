// frontend/src/modulo/ventas/componentePos.jsx (CORREGIDO - Moneda Bolivianos)
import React, { useState, useEffect } from 'react';
import { useCarritoStore } from '../../store/useCarritoStore';
import { obtenerProductos } from '../productos/servicioProductos';
import ComponenteCarrito from './componenteCarrito';
import ComponentePago from './componentePago';

const ComponentePos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarPago, setMostrarPago] = useState(false);
  const { items, vaciarCarrito, obtenerTotal, agregarItem, obtenerItemsParaVenta } = useCarritoStore();

  useEffect(() => {
    cargarProductos();
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

  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregarUnidad = (producto) => {
    if (producto.stockVitrina < 1) {
      alert(`❌ Stock insuficiente de ${producto.nombre}. Solo quedan ${producto.stockVitrina} unidades.`);
      return;
    }
    agregarItem(producto, 1, 'unidad');
  };

  const handleAgregarPack = (producto) => {
    const packsDisponibles = Math.floor(producto.stockVitrina / producto.unidadesPorPack);
    if (packsDisponibles < 1) {
      alert(`❌ No hay suficientes unidades para formar un pack de ${producto.unidadesPorPack}. Stock disponible: ${producto.stockVitrina} unidades.`);
      return;
    }
    agregarItem(producto, 1, 'pack');
  };

  const getIcono = (cat) => {
    const iconos = { whisky: '🥃', tequila: '🥂', vodka: '🍸', ron: '🍹', cerveza: '🍺', vino: '🍷' };
    return iconos[cat] || '🍾';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="bg-gradient-to-r from-celeste to-vino p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Productos</h2>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            
            <div className="p-6">
              {cargando ? (
                <div className="text-center py-12">Cargando...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {productosFiltrados.map(producto => {
                    const packsDisponibles = Math.floor(producto.stockVitrina / (producto.unidadesPorPack || 1));
                    
                    return (
                      <div key={producto._id} className="border rounded-xl p-4 hover:shadow-xl transition-all hover:scale-105">
                        <div className="flex items-start gap-3">
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {producto.imagenUrlCompleta ? (
                              <img 
                                src={producto.imagenUrlCompleta} 
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-4xl">{getIcono(producto.categoria)}</div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{producto.nombre}</h3>
                            <p className="text-gray-500 text-sm capitalize">{producto.categoria}</p>
                            
                            <div className="mt-2 space-y-2">
                              {/* Opción por Unidad */}
                              {(producto.tipoVenta === 'unidad' || producto.tipoVenta === 'ambos') && (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm text-gray-600">Unidad:</span>
                                    <span className="text-celeste font-bold ml-2">Bs {producto.precioUnitario}</span>
                                  </div>
                                  <button
                                    onClick={() => handleAgregarUnidad(producto)}
                                    className="btn-primary text-xs py-1 px-3"
                                    disabled={producto.stockVitrina === 0}
                                  >
                                    + Agregar
                                  </button>
                                </div>
                              )}
                              
                              {/* Opción por Pack */}
                              {(producto.tipoVenta === 'pack' || producto.tipoVenta === 'ambos') && producto.precioPack && (
                                <div className="flex justify-between items-center border-t pt-2 mt-1">
                                  <div>
                                    <span className="text-sm text-gray-600">Pack ({producto.unidadesPorPack} uds):</span>
                                    <span className="text-green-600 font-bold ml-2">Bs {producto.precioPack}</span>
                                    <p className="text-xs text-gray-400">
                                      ({packsDisponibles} packs disponibles)
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleAgregarPack(producto)}
                                    className="bg-green-500 text-white text-xs py-1 px-3 rounded hover:bg-green-600 transition"
                                    disabled={packsDisponibles === 0}
                                  >
                                    + Agregar Pack
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 flex justify-between items-center">
                              <span className={`text-xs px-2 py-1 rounded ${producto.stockVitrina <= producto.stockMinimoVitrina ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                Stock: {producto.stockVitrina} uds
                              </span>
                              {producto.precioMayoreo && (
                                <span className="text-xs text-vino">Mayoreo: Bs {producto.precioMayoreo}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          {!mostrarPago ? (
            <ComponenteCarrito onFinalizar={() => setMostrarPago(true)} />
          ) : (
            <ComponentePago
              total={obtenerTotal()}
              items={items}
              onCancelar={() => setMostrarPago(false)}
              onExito={(respuesta) => {
                vaciarCarrito();
                setMostrarPago(false);
                alert(`✅ Venta completada. Folio: ${respuesta.venta?.folio || 'N/A'}`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentePos;