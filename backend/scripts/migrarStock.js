import mongoose from 'mongoose';
import ModeloProducto from '../modulos/productos/modelos/modeloProducto.js';

const CONFIG = {
  MONGO_URI: 'mongodb://localhost:27017/licoreria_db'
};

const migrarStock = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Actualizar todos los productos que tengan stockActual pero no stockVitrina/stockAlmacen
    const productos = await ModeloProducto.find({});
    
    for (const producto of productos) {
      let actualizado = false;
      
      // Si tiene stockActual pero no stockVitrina, migrar
      if (producto.stockActual !== undefined && producto.stockVitrina === undefined) {
        producto.stockVitrina = producto.stockActual;
        producto.stockAlmacen = 0;
        actualizado = true;
      }
      
      // Asegurar que stockVitrina y stockAlmacen existen
      if (producto.stockVitrina === undefined) {
        producto.stockVitrina = 0;
        actualizado = true;
      }
      if (producto.stockAlmacen === undefined) {
        producto.stockAlmacen = 0;
        actualizado = true;
      }
      
      if (actualizado) {
        await producto.save();
        console.log(`✅ Producto actualizado: ${producto.nombre} - Vitrina: ${producto.stockVitrina}, Almacén: ${producto.stockAlmacen}`);
      }
    }
    
    console.log('\n🎉 Migración completada!');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
};

migrarStock();