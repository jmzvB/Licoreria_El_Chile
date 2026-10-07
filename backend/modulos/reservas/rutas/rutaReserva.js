// backend/modulos/reservas/rutas/rutaReserva.js (ACTUALIZADO)
import express from 'express';
import {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  actualizarReserva,
  cambiarEstadoReserva,
  convertirReservaAVenta,
  obtenerReporteReservas  // Agregar importación
} from '../controladores/controladorReserva.js';
import { verificarToken } from '../../../middleware/autenticacion.js';
import { soloAdmin } from '../../../middleware/rolPermisos.js';

const ruta = express.Router();

// Todas las rutas de reservas requieren autenticación y rol admin
ruta.use(verificarToken);
ruta.use(soloAdmin);

ruta.post('/', crearReserva);
ruta.get('/', obtenerReservas);
ruta.get('/reporte', obtenerReporteReservas); // Nueva ruta para reporte
ruta.get('/:id', obtenerReservaPorId);
ruta.put('/:id', actualizarReserva);
ruta.patch('/:id/estado', cambiarEstadoReserva);
ruta.post('/:id/convertir', convertirReservaAVenta);

export default ruta;