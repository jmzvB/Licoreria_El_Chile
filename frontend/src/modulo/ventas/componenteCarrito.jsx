// frontend/src/modulo/ventas/componenteCarrito.jsx (CORREGIDO - Mostrar packs como unidad)
import React, { useState } from 'react';
import { useCarritoStore } from '../../store/useCarritoStore';

const ComponenteCarrito = ({ onFinalizar }) => {
  const { items, eliminarItem, actualizarCantidad, obtenerTotal } = useCarritoStore();
  const [mostrarRegalos, setMostrarRegalos] = useState(false);
  const [regalosSeleccionados, setRegalosSeleccionados] = useState([]);
  
  const total = obtenerTotal();
  
  const opcionesRegalos = [
    { id: 1, nombre: '🥤 Vaso promocional', cantidad: 1, valor: 0 },
    { id: 2, nombre: '🍺 Cerveza Corona', cantidad: 1, valor: 0 },
    { id: 3, nombre: '🥃 Shot de tequila', cantidad: 1, valor: 0 },
    { id: 4, nombre: '🍷 Copa de vino', cantidad: 1, valor: 0 },
    { id: 5, nombre: '🎁 Llavero El Chile', cantidad: 1, valor: 0 },
  ];

  const agregarRegalo = (regalo) => {
    if (!regalosSeleccionados.find(r => r.id === regalo.id)) {
      setRegalosSeleccionados([...regalosSeleccionados, regalo]);
    }
  };

  const eliminarRegalo = (regaloId) => {
    setRegalosSeleccionados(regalosSeleccionados.filter(r => r.id !== regaloId));
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🛒</span>
          <h2 className="text-2xl font-bold text-vino">Carrito</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-gray-500">Tu carrito está vacío</p>
          <p className="text-sm text-gray-400 mt-2">Agrega productos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🛒</span>
        <h2 className="text-2xl font-bold text-vino">Carrito</h2>
        <span className="bg-celeste text-white px-2 py-1 rounded-full text-sm ml-auto">
          {items.length} items
        </span>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4 pr-2">
        {items.map(item => (
          <div key={`${item.productoId}-${item.tipo}`} className="border-b pb-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{item.nombre}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-celeste font-bold">${item.precioUnitario?.toFixed(2)}</p>
                  {item.tipo === 'pack' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Pack {item.unidadesPorItem} pzas
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => eliminarItem(item.productoId, item.tipo)}
                className="text-red-500 hover:text-red-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => actualizarCantidad(item.productoId, Math.max(1, item.cantidad - 1), item.tipo)}
                  className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-semibold">{item.cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1, item.tipo)}
                  className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>
              <span className="font-bold text-lg text-celeste">
                ${(item.totalItem || 0).toFixed(2)}
              </span>
            </div>
            {item.tipo === 'pack' && (
              <p className="text-xs text-gray-400 mt-1">
                Equivale a {item.cantidad * item.unidadesPorItem} unidades físicas
              </p>
            )}
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-4">
        <button
          onClick={() => setMostrarRegalos(!mostrarRegalos)}
          className="w-full mb-3 flex items-center justify-center gap-2 text-celeste hover:text-celeste-dark transition"
        >
          <span className="text-xl">🎁</span>
          <span className="font-semibold">Agregar Regalía</span>
          <span>{mostrarRegalos ? '▲' : '▼'}</span>
        </button>
        
        {mostrarRegalos && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">Elige tu regalo:</h4>
            <div className="grid grid-cols-2 gap-2">
              {opcionesRegalos.map(regalo => (
                <button
                  key={regalo.id}
                  onClick={() => agregarRegalo(regalo)}
                  disabled={regalosSeleccionados.some(r => r.id === regalo.id)}
                  className="text-left px-2 py-1 text-sm bg-white rounded border hover:bg-amber-100 disabled:opacity-50 disabled:bg-gray-100 transition"
                >
                  {regalo.nombre}
                </button>
              ))}
            </div>
            
            {regalosSeleccionados.length > 0 && (
              <div className="mt-3 pt-2 border-t">
                <p className="text-sm font-semibold text-amber-800 mb-1">Regalos seleccionados:</p>
                {regalosSeleccionados.map(regalo => (
                  <div key={regalo.id} className="flex justify-between items-center text-sm">
                    <span>🎁 {regalo.nombre}</span>
                    <button onClick={() => eliminarRegalo(regalo.id)} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t pt-4 mt-2">
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-3xl font-bold text-celeste">${total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">IVA incluido</p>
      </div>
      
      <button
        onClick={onFinalizar}
        className="btn-secondary w-full py-3 text-lg rounded-xl font-semibold transition-all hover:shadow-lg active:scale-95 mt-4"
      >
        💰 Finalizar Compra
        {regalosSeleccionados.length > 0 && ` (+${regalosSeleccionados.length} regalo${regalosSeleccionados.length > 1 ? 's' : ''})`}
      </button>
    </div>
  );
};

export default ComponenteCarrito;