// backend/scripts/crearAdmin.js
import mongoose from 'mongoose';
import ModeloUsuario from '../modulos/autenticacion/modelos/modeloUsuario.js';

const CONFIG = {
  MONGO_URI: 'mongodb://localhost:27017/licoreria_db'
};

// 👇 Datos del admin (cámbialos si quieres)
const ADMIN = {
  nombreCompleto: 'Administrador Principal',
  email: 'admin@licoreria.com',
  contrasenia: 'admin123',
  rol: 'admin',
  activo: true,
  telefono: '0000000000'
};

const crearAdmin = async () => {
  try {
    console.log('\n🔌 Conectando a MongoDB...');
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log('✅ Conectado\n');

    // Ver si ya existe
    const existe = await ModeloUsuario.findOne({ email: ADMIN.email });
    if (existe) {
      console.log('⚠️  Ya existe un usuario con ese email. Lo eliminamos y creamos uno nuevo...');
      await ModeloUsuario.deleteOne({ email: ADMIN.email });
    }

    // Crear admin (la contraseña se encripta sola por el pre('save'))
    const nuevo = await ModeloUsuario.create(ADMIN);

    console.log('\n🎉 ¡ADMIN CREADO EXITOSAMENTE!\n');
    console.log('════════════════════════════════════════');
    console.log('📧 Email:       ', ADMIN.email);
    console.log('🔑 Contraseña:  ', ADMIN.contrasenia);
    console.log('👤 Rol:         ', ADMIN.rol);
    console.log('🆔 ID:          ', nuevo._id);
    console.log('════════════════════════════════════════');
    console.log('\n✅ Ahora entra al navegador y usa estos datos\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

crearAdmin();