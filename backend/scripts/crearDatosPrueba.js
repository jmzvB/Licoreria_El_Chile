// backend/scripts/crearDatosPrueba.js (ACTUALIZADO - agregar clienteAnticipado)
import mongoose from 'mongoose';
import ModeloUsuario from '../modulos/autenticacion/modelos/modeloUsuario.js';
import ModeloProducto from '../modulos/productos/modelos/modeloProducto.js';

const CONFIG = {
  MONGO_URI: 'mongodb://localhost:27017/licoreria_db'
};

const crearDatosPrueba = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log('Conectado a MongoDB');
    
    // Crear usuarios de prueba
    const adminExistente = await ModeloUsuario.findOne({ email: 'admin@licoreria.com' });
    if (!adminExistente) {
      const admin = new ModeloUsuario({
        email: 'admin@licoreria.com',
        contrasenia: 'admin123',
        nombreCompleto: 'Administrador Principal',
        rol: 'admin',
        telefono: '555-1234'
      });
      await admin.save();
      console.log('✅ Usuario admin creado: admin@licoreria.com / admin123');
    }
    
    const vendedorExistente = await ModeloUsuario.findOne({ email: 'vendedor@licoreria.com' });
    if (!vendedorExistente) {
      const vendedor = new ModeloUsuario({
        email: 'vendedor@licoreria.com',
        contrasenia: 'vendedor123',
        nombreCompleto: 'Vendedor Principal',
        rol: 'vendedor',
        telefono: '555-5678'
      });
      await vendedor.save();
      console.log('✅ Usuario vendedor creado: vendedor@licoreria.com / vendedor123');
    }
    
    // Crear cliente anticipado de ejemplo
    const clienteAnticipadoExistente = await ModeloUsuario.findOne({ email: 'cliente@evento.com' });
    if (!clienteAnticipadoExistente) {
      const clienteAnticipado = new ModeloUsuario({
        email: 'cliente@evento.com',
        contrasenia: 'cliente123',
        nombreCompleto: 'Cliente de Eventos',
        rol: 'clienteAnticipado',
        telefono: '555-9999',
        codigoInvitacion: `INV-${Date.now()}-cliente`
      });
      await clienteAnticipado.save();
      console.log('✅ Usuario cliente anticipado creado: cliente@evento.com / cliente123');
    }
    
    // Crear productos de prueba con imágenes (opcional)
    const productos = [
      { nombre: 'Whisky Johnnie Walker Black Label', categoria: 'whisky', precioUnitario: 850, costoUnitario: 600, stockVitrina: 50, stockAlmacen: 100 },
      { nombre: 'Tequila Don Julio 70', categoria: 'tequila', precioUnitario: 1200, costoUnitario: 850, stockVitrina: 30, stockAlmacen: 60 },
      { nombre: 'Vodka Absolut', categoria: 'vodka', precioUnitario: 350, costoUnitario: 200, stockVitrina: 100, stockAlmacen: 200 },
      { nombre: 'Ron Bacardi Carta Blanca', categoria: 'ron', precioUnitario: 280, costoUnitario: 150, stockVitrina: 80, stockAlmacen: 150 },
      { nombre: 'Cerveza Corona (6 pack)', categoria: 'cerveza', precioUnitario: 180, costoUnitario: 120, stockVitrina: 200, stockAlmacen: 400 },
      { nombre: 'Vino Tinto Casillero del Diablo', categoria: 'vino', precioUnitario: 320, costoUnitario: 200, stockVitrina: 60, stockAlmacen: 120 }
    ];
    
    for (const productoData of productos) {
      const existente = await ModeloProducto.findOne({ nombre: productoData.nombre });
      if (!existente) {
        const producto = new ModeloProducto(productoData);
        await producto.save();
        console.log(`✅ Producto creado: ${productoData.nombre}`);
      }
    }
    
    console.log('\n🎉 Datos de prueba creados exitosamente!');
    console.log('\nCredenciales de acceso:');
    console.log('Admin: admin@licoreria.com / admin123');
    console.log('Vendedor: vendedor@licoreria.com / vendedor123');
    console.log('Cliente Anticipado: cliente@evento.com / cliente123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
    process.exit(1);
  }
};

crearDatosPrueba();