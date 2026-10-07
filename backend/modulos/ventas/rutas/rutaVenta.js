// backend/modulos/ventas/rutas/rutaVenta.js (ACTUALIZADO)
import express from 'express';
import { crearVenta, obtenerVentas } from '../controladores/controladorVenta.js';
import { obtenerDashboard } from '../controladores/controladorDashboard.js';
import { verificarToken } from '../../../middleware/autenticacion.js';
import { soloVendedor, soloAdmin } from '../../../middleware/rolPermisos.js';

const ruta = express.Router();

ruta.post('/', verificarToken, soloVendedor, crearVenta);
ruta.get('/', verificarToken, soloVendedor, obtenerVentas);
ruta.get('/dashboard', verificarToken, soloAdmin, obtenerDashboard);

export default ruta;