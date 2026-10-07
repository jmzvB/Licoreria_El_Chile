// backend/modulos/productos/rutas/rutaProducto.js (ACTUALIZADO)
import express from 'express';
import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  actualizarStockVitrina,
  actualizarStockAlmacen,
  reabastecerVitrina,
  obtenerAlertasStockBajo
} from '../controladores/controladorProducto.js';
import { verificarToken } from '../../../middleware/autenticacion.js';
import { soloAdmin, soloVendedor } from '../../../middleware/rolPermisos.js';
import upload from '../../../middleware/subirImagen.js';

const ruta = express.Router();

ruta.post('/', verificarToken, soloAdmin, upload.single('imagen'), crearProducto);
ruta.get('/', verificarToken, soloVendedor, obtenerProductos);
ruta.get('/alertas-stock', verificarToken, soloAdmin, obtenerAlertasStockBajo);
ruta.get('/:id', verificarToken, soloVendedor, obtenerProductoPorId);
ruta.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), actualizarProducto);
ruta.delete('/:id', verificarToken, soloAdmin, eliminarProducto);
ruta.patch('/:id/stock-vitrina', verificarToken, soloAdmin, actualizarStockVitrina);
ruta.patch('/:id/stock-almacen', verificarToken, soloAdmin, actualizarStockAlmacen);
ruta.post('/:id/reabastecer', verificarToken, soloAdmin, reabastecerVitrina);

export default ruta;