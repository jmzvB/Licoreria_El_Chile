import React, { useState } from 'react';

const ComponenteCierreCaja = () => {
  const [fechas, setFechas] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-vino mb-6">Cierre de Caja</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={fechas.inicio}
              onChange={(e) => setFechas({...fechas, inicio: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={fechas.fin}
              onChange={(e) => setFechas({...fechas, fin: e.target.value})}
              className="input-field"
            />
          </div>
        </div>
        <button className="btn-primary mt-4">
          Generar Reporte
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-vino mb-4">Resumen del Día</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">Total Ventas</p>
            <p className="text-2xl font-bold text-celeste">$0.00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">Productos Vendidos</p>
            <p className="text-2xl font-bold text-celeste">0</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">Efectivo en Caja</p>
            <p className="text-2xl font-bold text-celeste">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponenteCierreCaja;