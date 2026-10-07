// frontend/src/modulo/dashboard/componenteDashboard.jsx (ACTUALIZADO - Moneda Bolivianos)
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const ComponenteDashboard = () => {
  const [datos, setDatos] = useState({
    ventasDiarias: [],
    ventasMensuales: [],
    totalMes: 0,
    productosVendidos: 0,
    topProductos: []
  });
  const [cargando, setCargando] = useState(true);
  const [tipoGrafico, setTipoGrafico] = useState('diario');
  const { token } = useAuthStore();

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ventas/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDatos(data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const descargarReporteCSV = () => {
    let csvContent = "📊 REPORTE DE VENTAS\n\n";
    csvContent += "VENTAS DIARIAS (Últimos 7 días)\n";
    csvContent += "Fecha,Día,Total\n";
    datos.ventasDiarias.forEach(venta => {
      csvContent += `${venta.fecha},${venta.dia},Bs ${venta.total.toFixed(2)}\n`;
    });
    
    csvContent += "\nVENTAS MENSUALES (Últimos 6 meses)\n";
    csvContent += "Mes,Año,Total,Cantidad de Ventas\n";
    datos.ventasMensuales.forEach(venta => {
      csvContent += `${venta.mes},${venta.año},Bs ${venta.total.toFixed(2)},${venta.cantidad}\n`;
    });
    
    csvContent += `\nRESUMEN DEL MES\n`;
    csvContent += `Total Ventas Mes,Bs ${datos.totalMes.toFixed(2)}\n`;
    csvContent += `Productos Vendidos,${datos.productosVendidos}\n`;
    
    csvContent += `\nTOP 5 PRODUCTOS MÁS VENDIDOS\n`;
    csvContent += `Producto,Cantidad,Ingreso\n`;
    datos.topProductos.forEach(p => {
      csvContent += `${p._id},${p.cantidad},Bs ${p.ingreso.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  if (cargando) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-celeste"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-vino mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-celeste to-celeste-dark rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Total Ventas del Mes</p>
          <p className="text-3xl font-bold">Bs {datos.totalMes.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-vino to-vino-dark rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Productos Vendidos</p>
          <p className="text-3xl font-bold">{datos.productosVendidos}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Ventas del Mes</p>
          <p className="text-3xl font-bold">{datos.ventasMensuales[datos.ventasMensuales.length-1]?.cantidad || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl shadow-lg p-6 text-white">
          <p className="text-sm opacity-90">Ticket Promedio</p>
          <p className="text-3xl font-bold">
            Bs {datos.ventasMensuales[datos.ventasMensuales.length-1]?.cantidad > 0 
              ? (datos.totalMes / datos.ventasMensuales[datos.ventasMensuales.length-1].cantidad).toFixed(2) 
              : '0'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-vino">Análisis de Ventas</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTipoGrafico('diario')}
              className={`px-4 py-2 rounded-lg transition ${tipoGrafico === 'diario' ? 'bg-celeste text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              📅 Ventas Diarias
            </button>
            <button
              onClick={() => setTipoGrafico('mensual')}
              className={`px-4 py-2 rounded-lg transition ${tipoGrafico === 'mensual' ? 'bg-celeste text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              📊 Ventas Mensuales
            </button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {tipoGrafico === 'diario' ? (
              <BarChart data={datos.ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => `Bs ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="total" fill="#4BA8BE" name="Ventas del día" />
              </BarChart>
            ) : (
              <LineChart data={datos.ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `Bs ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8A3A4F" name="Ventas mensuales" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-vino mb-4">🏆 Top 5 Productos Más Vendidos</h2>
          <div className="space-y-3">
            {datos.topProductos.map((producto, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'}</span>
                  <div>
                    <p className="font-semibold">{producto._id}</p>
                    <p className="text-sm text-gray-500">{producto.cantidad} unidades vendidas</p>
                  </div>
                </div>
                <p className="font-bold text-celeste">Bs {producto.ingreso.toFixed(2)}</p>
              </div>
            ))}
            {datos.topProductos.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay ventas registradas este mes</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-vino mb-4">📈 Resumen Rápido</h2>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Ventas última semana</p>
              <p className="text-2xl font-bold text-green-600">
                Bs {datos.ventasDiarias.reduce((sum, d) => sum + d.total, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Mejor día de ventas (última semana)</p>
              <p className="text-2xl font-bold text-blue-600">
                {datos.ventasDiarias.reduce((max, d) => d.total > max.total ? d : max, { total: 0, dia: 'Ninguno' }).dia}
                {datos.ventasDiarias.some(d => d.total > 0) && ` - Bs ${Math.max(...datos.ventasDiarias.map(d => d.total)).toFixed(2)}`}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Promedio diario (última semana)</p>
              <p className="text-2xl font-bold text-purple-600">
                Bs {(datos.ventasDiarias.reduce((sum, d) => sum + d.total, 0) / 7).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-vino mb-4">Reportes</h2>
        <button onClick={descargarReporteCSV} className="btn-primary flex items-center gap-2">
          📊 Descargar Reporte Completo (CSV)
        </button>
      </div>
    </div>
  );
};

export default ComponenteDashboard;