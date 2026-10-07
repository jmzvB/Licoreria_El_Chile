import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const iniciarSesion = async (email, contrasenia) => {
  try {
    const respuesta = await axios.post(`${API_URL}/auth/iniciar-sesion`, {
      email,
      contrasenia
    });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al iniciar sesión' };
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('auth-storage');
};

export const registrarUsuario = async (datosUsuario) => {
  try {
    const respuesta = await axios.post(`${API_URL}/auth/registrar`, datosUsuario);
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al registrar usuario' };
  }
};

export const renovarToken = async (tokenRefresco) => {
  try {
    const respuesta = await axios.post(`${API_URL}/auth/renovar-token`, {
      tokenRefresco
    });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al renovar token' };
  }
};