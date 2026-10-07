import jwt from 'jsonwebtoken';
import ModeloUsuario from '../modelos/modeloUsuario.js';

const CONFIG = {
  JWT_SECRET: 'clave_super_segura_licoreria_2024',
  JWT_REFRESH_SECRET: 'clave_refresh_licoreria_2024'
};

const generarTokenAcceso = (idUsuario, rol, email) => {
  return jwt.sign(
    { id: idUsuario, rol: rol, email: email, tipo: 'acceso' },
    CONFIG.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generarTokenRefresco = (idUsuario, rol, email) => {
  return jwt.sign(
    { id: idUsuario, rol: rol, email: email, tipo: 'refresco' },
    CONFIG.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const iniciarSesion = async (req, res) => {
  try {
    const { email, contrasenia } = req.body;
    
    const usuario = await ModeloUsuario.findOne({ email, activo: true });
    if (!usuario) {
      return res.status(401).json({ 
        error: 'credenciales_invalidas', 
        mensaje: 'Email o contraseña incorrectos' 
      });
    }
    
    const contraseniaValida = await usuario.compararContrasenia(contrasenia);
    if (!contraseniaValida) {
      return res.status(401).json({ 
        error: 'credenciales_invalidas', 
        mensaje: 'Email o contraseña incorrectos' 
      });
    }
    
    usuario.ultimoAcceso = new Date();
    await usuario.save();
    
    const tokenAcceso = generarTokenAcceso(usuario._id, usuario.rol, usuario.email);
    const tokenRefresco = generarTokenRefresco(usuario._id, usuario.rol, usuario.email);
    
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      },
      tokens: {
        acceso: tokenAcceso,
        refresco: tokenRefresco
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'error_servidor', mensaje: error.message });
  }
};

export const registrarUsuario = async (req, res) => {
  try {
    const { email, contrasenia, nombreCompleto, rol, telefono } = req.body;
    
    const usuarioExistente = await ModeloUsuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'email_existente', 
        mensaje: 'Ya existe un usuario con este email' 
      });
    }
    
    const usuario = new ModeloUsuario({
      email,
      contrasenia,
      nombreCompleto,
      rol: rol || 'vendedor',
      telefono
    });
    
    if (rol === 'clienteAnticipado') {
      usuario.codigoInvitacion = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
    
    await usuario.save();
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'error_servidor', mensaje: error.message });
  }
};

export const renovarToken = async (req, res) => {
  try {
    const { tokenRefresco } = req.body;
    
    if (!tokenRefresco) {
      return res.status(401).json({ 
        error: 'token_requerido', 
        mensaje: 'Token de refresco no proporcionado' 
      });
    }
    
    const decoded = jwt.verify(tokenRefresco, CONFIG.JWT_REFRESH_SECRET);
    
    if (decoded.tipo !== 'refresco') {
      return res.status(401).json({ 
        error: 'token_invalido', 
        mensaje: 'Token de refresco inválido' 
      });
    }
    
    const usuario = await ModeloUsuario.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        error: 'usuario_inactivo', 
        mensaje: 'Usuario no encontrado o inactivo' 
      });
    }
    
    const nuevoTokenAcceso = generarTokenAcceso(usuario._id, usuario.rol, usuario.email);
    
    res.json({
      mensaje: 'Token renovado exitosamente',
      tokenAcceso: nuevoTokenAcceso
    });
  } catch (error) {
    res.status(401).json({ 
      error: 'token_invalido', 
      mensaje: 'Token de refresco inválido o expirado' 
    });
  }
};

// backend/modulos/autenticacion/controladores/controladorAuth.js (AGREGAR NUEVA FUNCIÓN)
// Agrega esta función al final del archivo

export const buscarOCrearCliente = async (req, res) => {
  try {
    const { email, nombreCompleto, telefono } = req.body;
    
    if (!email || !nombreCompleto) {
      return res.status(400).json({ 
        error: 'datos_incompletos', 
        mensaje: 'Email y nombre completo son requeridos' 
      });
    }
    
    // Buscar si ya existe un cliente con ese email
    let cliente = await ModeloUsuario.findOne({ email });
    
    if (!cliente) {
      // Crear nuevo cliente anticipado
      cliente = new ModeloUsuario({
        email,
        nombreCompleto,
        telefono: telefono || '',
        contrasenia: Math.random().toString(36).slice(-8), // Contraseña temporal
        rol: 'clienteAnticipado',
        codigoInvitacion: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        activo: true
      });
      await cliente.save();
      console.log(`✅ Nuevo cliente creado: ${email}`);
    }
    
    res.json({
      mensaje: 'Cliente encontrado/creado exitosamente',
      cliente: {
        id: cliente._id,
        nombreCompleto: cliente.nombreCompleto,
        email: cliente.email,
        telefono: cliente.telefono,
        rol: cliente.rol
      }
    });
  } catch (error) {
    console.error('Error en buscarOCrearCliente:', error);
    res.status(500).json({ error: 'error_servidor', mensaje: error.message });
  }
};


// backend/modulos/autenticacion/controladores/controladorAuth.js
// Agrega esta función al final del archivo

export const obtenerClientesAnticipados = async (req, res) => {
  try {
    const clientes = await ModeloUsuario.find({ 
      rol: 'clienteAnticipado',
      activo: true 
    }).select('_id nombreCompleto email telefono');
    
    res.json({
      usuarios: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'error_servidor', mensaje: error.message });
  }
};