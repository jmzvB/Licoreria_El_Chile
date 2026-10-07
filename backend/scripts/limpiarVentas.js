import mongoose from 'mongoose';
import ModeloVenta from '../modulos/ventas/modelos/modeloVenta.js';

const CONFIG = {
  MONGO_URI: 'mongodb://localhost:27017/licoreria_db'
};

const limpiarVentas = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Eliminar todas las ventas que no tengan folio
    const resultado = await ModeloVenta.deleteMany({ folio: { $exists: false } });
    console.log(`✅ Eliminadas ${resultado.deletedCount} ventas sin folio`);
    
    // Actualizar ventas existentes con folio nulo
    const ventasSinFolio = await ModeloVenta.find({ folio: null });
    for (const venta of ventasSinFolio) {
      venta.folio = await ModeloVenta.generarFolio();
      await venta.save();
      console.log(`📄 Folio asignado a venta ${venta._id}: ${venta.folio}`);
    }
    
    console.log('\n🎉 Limpieza completada!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

limpiarVentas();