export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'no_autenticado', 
        mensaje: 'Usuario no autenticado' 
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'permiso_denegado', 
        mensaje: `Acceso denegado. Rol ${req.usuario.rol} no tiene permiso. Roles permitidos: ${rolesPermitidos.join(', ')}` 
      });
    }
    
    next();
  };
};

export const soloAdmin = verificarRol(['admin']);
export const soloVendedor = verificarRol(['admin', 'vendedor']);
export const soloClienteAnticipado = verificarRol(['clienteAnticipado']);