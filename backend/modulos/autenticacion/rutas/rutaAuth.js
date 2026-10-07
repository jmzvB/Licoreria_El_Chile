// backend/modulos/autenticacion/rutas/rutaAuth.js (ACTUALIZADO COMPLETO)
import express from 'express';
import { 
  iniciarSesion, 
  registrarUsuario, 
  renovarToken,
  buscarOCrearCliente,
  obtenerClientesAnticipados  // Agregar esta importación
} from '../controladores/controladorAuth.js';
import { verificarToken } from '../../../middleware/autenticacion.js';
import { soloAdmin } from '../../../middleware/rolPermisos.js';

const ruta = express.Router();

ruta.post('/iniciar-sesion', iniciarSesion);
ruta.post('/registrar', registrarUsuario);
ruta.post('/renovar-token', renovarToken);
ruta.post('/buscar-crear-cliente', verificarToken, soloAdmin, buscarOCrearCliente);
ruta.get('/usuarios', verificarToken, soloAdmin, obtenerClientesAnticipados); // Nueva ruta

export default ruta;