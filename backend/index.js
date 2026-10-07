// backend/index.js (ACTUALIZADO - con ruta raíz y mejoras)
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuración de módulos
import moduloAutenticacion from './modulos/autenticacion/index.js';
import moduloProductos from './modulos/productos/index.js';
import moduloVentas from './modulos/ventas/index.js';
import { rutaReserva } from './modulos/reservas/index.js';

const CONFIG = {
  PUERTO: 5000,
  MONGO_URI: 'mongodb://localhost:27017/licoreria_db',
  JWT_SECRET: 'clave_super_segura_licoreria_2024',
  JWT_REFRESH_SECRET: 'clave_refresh_licoreria_2024'
};

const app = express();

// ==================== MIDDLEWARES GLOBALES ====================
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== CONEXIÓN A MONGODB ====================
mongoose.connect(CONFIG.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB en:', CONFIG.MONGO_URI);
  })
  .catch(error => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// ==================== RUTA RAÍZ (INFO DE LA API) ====================
app.get('/', (req, res) => {
  res.json({
    mensaje: '🍺 API Licorería El Chileno',
    version: '1.0.0',
    estado: 'funcionando',
    baseDatos: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
    endpoints: {
      autenticacion: '/api/auth',
      productos: '/api/productos',
      ventas: '/api/ventas',
      reservas: '/api/reservas',
      health: '/api/health'
    }
  });
});

// ==================== RUTA DE SALUD ====================
app.get('/api/health', (req, res) => {
  res.json({
    estado: 'sistema_operativo',
    mensaje: 'Licorería API funcionando correctamente',
    baseDatos: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
    timestamp: new Date().toISOString()
  });
});

// ==================== RUTAS DE MÓDULOS ====================
app.use('/api/auth', moduloAutenticacion);
app.use('/api/productos', moduloProductos);
app.use('/api/ventas', moduloVentas);
app.use('/api/reservas', rutaReserva);

// ==================== MANEJO DE RUTAS NO ENCONTRADAS (404) ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'ruta_no_encontrada',
    mensaje: `La ruta ${req.originalUrl} no existe en esta API`,
    sugerencia: 'Revisa GET / para ver los endpoints disponibles'
  });
});

// ==================== MIDDLEWARE DE ERRORES (SIEMPRE AL FINAL) ====================
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({
    error: 'error_interno_servidor',
    mensaje: err.message
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(CONFIG.PUERTO, () => {
  console.log('════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en http://localhost:${CONFIG.PUERTO}`);
  console.log(`📊 MongoDB: ${CONFIG.MONGO_URI}`);
  console.log(`🖼️  Archivos estáticos: /uploads`);
  console.log(`📖 Documentación API: http://localhost:${CONFIG.PUERTO}/`);
  console.log('════════════════════════════════════════');
});