// frontend/src/modulo/productos/servicioProductos.js (CORREGIDO)
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = 'http://localhost:5000/api';

const obtenerHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const obtenerProductos = async (filtros = {}) => {
  try {
    const respuesta = await axios.get(`${API_URL}/productos`, { 
      ...obtenerHeaders(), 
      params: filtros 
    });
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener productos' };
  }
};

export const crearProducto = async (datosProducto) => {
  try {
    // Obtener headers sin Content-Type para que axios lo maneje automáticamente con FormData
    const { headers } = obtenerHeaders();
    
    const respuesta = await axios.post(`${API_URL}/productos`, datosProducto, { 
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data' // Forzar multipart
      }
    });
    return respuesta.data;
  } catch (error) {
    console.error('Error en crearProducto:', error);
    throw error.response?.data || { error: 'Error al crear producto' };
  }
};

export const actualizarProducto = async (id, datosProducto) => {
  try {
    const { headers } = obtenerHeaders();
    
    const respuesta = await axios.put(`${API_URL}/productos/${id}`, datosProducto, { 
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return respuesta.data;
  } catch (error) {
    console.error('Error en actualizarProducto:', error);
    throw error.response?.data || { error: 'Error al actualizar producto' };
  }
};

export const eliminarProducto = async (id) => {
  try {
    const respuesta = await axios.delete(`${API_URL}/productos/${id}`, obtenerHeaders());
    return respuesta.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al eliminar producto' };
  }
};