// frontend/src/modulo/ventas/componentePago.jsx (CORREGIDO)
import React, { useState } from 'react';
import { registrarVenta } from './servicioVentas';
import { useAuthStore } from '../../store/useAuthStore';
import { useCarritoStore } from '../../store/useCarritoStore'; // ← IMPORTANTE: agregar esta línea

const ComponentePago = ({ total, items, onCancelar, onExito }) => {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [referenciaQr, setReferenciaQr] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { usuario } = useAuthStore();
  const { obtenerItemsParaVenta } = useCarritoStore(); // ← AHORA SÍ FUNCIONA

  const montoNumerico = parseFloat(montoRecibido) || 0;
  const cambio = metodoPago === 'efectivo' && montoNumerico >= total ? montoNumerico - total : 0;
  const montoInsuficiente = metodoPago === 'efectivo' && montoNumerico > 0 && montoNumerico < total;

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    if (!items || items.length === 0) {
      setError('No hay productos en el carrito');
      setCargando(false);
      return;
    }

    if (metodoPago === 'efectivo') {
      if (!montoRecibido || montoRecibido === '') {
        setError('Ingrese el monto recibido');
        setCargando(false);
        return;
      }
      if (montoNumerico < total) {
        setError(`El monto recibido ($${montoNumerico.toFixed(2)}) es menor al total ($${total.toFixed(2)})`);
        setCargando(false);
        return;
      }
    }

    if (metodoPago === 'qr' && !referenciaQr) {
      setError('Ingrese la referencia de la transacción');
      setCargando(false);
      return;
    }

    const productosParaVenta = obtenerItemsParaVenta();
    
    const datosVenta = {
      productos: productosParaVenta.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      })),
      metodoPago,
      total: total
    };

    if (metodoPago === 'efectivo') {
      datosVenta.montoRecibido = montoNumerico;
    } else if (metodoPago === 'qr') {
      datosVenta.referenciaTransaccion = referenciaQr;
    }

    try {
      const respuesta = await registrarVenta(datosVenta);
      onExito(respuesta);
    } catch (err) {
      setError(err.mensaje || err.error || 'Error al procesar el pago');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-vino mb-4">💰 Pago</h2>
      
      <div className="mb-4 p-4 bg-gradient-to-r from-celeste/10 to-vino/10 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span>${(total / 1.16).toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">IVA (16%):</span>
          <span>${(total - (total / 1.16)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl pt-2 border-t">
          <span>Total a pagar:</span>
          <span className="text-celeste">${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={manejarSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Método de Pago</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="input-field"
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="qr">📱 QR / Transferencia</option>
            <option value="mixto">💳 Mixto (Efectivo + QR)</option>
          </select>
        </div>

        {metodoPago === 'efectivo' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Monto Recibido</label>
            <input
              type="number"
              value={montoRecibido}
              onChange={(e) => setMontoRecibido(e.target.value)}
              className="input-field"
              required
              min={total}
              step="0.01"
              placeholder={`$${total.toFixed(2)} mínimo`}
            />
            {montoRecibido && montoNumerico >= total && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-green-700 font-semibold">💰 Cambio: ${cambio.toFixed(2)}</p>
              </div>
            )}
            {montoInsuficiente && (
              <p className="text-red-500 mt-1 text-sm">❌ Falta: ${(total - montoNumerico).toFixed(2)}</p>
            )}
          </div>
        )}

        {metodoPago === 'qr' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Referencia de Transacción</label>
            <input
              type="text"
              value={referenciaQr}
              onChange={(e) => setReferenciaQr(e.target.value)}
              className="input-field"
              required
              placeholder="Ej: REF-123456"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando || (metodoPago === 'efectivo' && montoNumerico < total)}
            className="flex-1 btn-secondary py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Procesando...
              </span>
            ) : (
              '✅ Confirmar Pago'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentePago;