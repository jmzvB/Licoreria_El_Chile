import jwt from 'jsonwebtoken';

const CONFIG = {
  JWT_SECRET: 'clave_super_segura_licoreria_2024'
};

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'no_autorizado', 
        mensaje: 'Token de autenticación no proporcionado' 
      });
    }
    
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'token_invalido', 
      mensaje: 'El token de autenticación es inválido o ha expirado' 
    });
  }
};