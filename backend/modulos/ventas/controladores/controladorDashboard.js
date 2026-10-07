// backend/modulos/ventas/controladores/controladorDashboard.js (ACTUALIZADO COMPLETO)
import ModeloVenta from '../modelos/modeloVenta.js';

export const obtenerDashboard = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Obtener ventas diarias de los últimos 7 días
    const ventasDiarias = await ModeloVenta.aggregate([
      {
        $match: {
          fechaHora: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fechaHora" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Obtener ventas mensuales de los últimos 6 meses
    const ventasMensuales = await ModeloVenta.aggregate([
      {
        $match: {
          fechaHora: { $gte: new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1) },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: {
            año: { $year: "$fechaHora" },
            mes: { $month: "$fechaHora" }
          },
          total: { $sum: "$total" },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { "_id.año": 1, "_id.mes": 1 } }
    ]);

    // Obtener total del mes actual
    const totalMesResult = await ModeloVenta.aggregate([
      {
        $match: {
          fechaHora: { $gte: inicioMes, $lte: finMes },
          estado: 'completada'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          productosVendidos: { $sum: { $size: "$productos" } }
        }
      }
    ]);

    // Formatear ventas diarias (redondeadas a 2 decimales)
    const ventasDiariasFormateadas = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
      const ventaDia = ventasDiarias.find(v => v._id === fechaStr);
      ventasDiariasFormateadas.push({
        fecha: fechaStr,
        dia: nombreDia,
        total: ventaDia ? Number(ventaDia.total.toFixed(2)) : 0
      });
    }

    // Formatear ventas mensuales (redondeadas a 2 decimales)
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ventasMensualesFormateadas = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesIndex = fecha.getMonth();
      const año = fecha.getFullYear();
      const ventaMes = ventasMensuales.find(v => v._id.año === año && v._id.mes === mesIndex + 1);
      ventasMensualesFormateadas.push({
        mes: meses[mesIndex],
        año: año,
        total: ventaMes ? Number(ventaMes.total.toFixed(2)) : 0,
        cantidad: ventaMes ? ventaMes.cantidad : 0
      });
    }

    // Top 5 productos más vendidos (con ingreso redondeado)
    const topProductos = await ModeloVenta.aggregate([
      {
        $match: {
          fechaHora: { $gte: inicioMes, $lte: finMes },
          estado: 'completada'
        }
      },
      { $unwind: "$productos" },
      {
        $group: {
          _id: "$productos.nombre",
          cantidad: { $sum: "$productos.cantidad" },
          ingreso: { $sum: "$productos.precioTotal" }
        }
      },
      { $sort: { cantidad: -1 } },
      { $limit: 5 }
    ]);

    // Redondear ingresos del top
    const topProductosFormateados = topProductos.map(p => ({
      ...p,
      ingreso: Number(p.ingreso.toFixed(2))
    }));

    res.json({
      ventasDiarias: ventasDiariasFormateadas,
      ventasMensuales: ventasMensualesFormateadas,
      totalMes: totalMesResult[0]?.total ? Number(totalMesResult[0].total.toFixed(2)) : 0,
      productosVendidos: totalMesResult[0]?.productosVendidos || 0,
      topProductos: topProductosFormateados
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'error_obtener_dashboard', mensaje: error.message });
  }
};