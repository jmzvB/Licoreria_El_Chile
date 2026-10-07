// frontend/src/modulo/ventas/servicioVentas.js (CORREGIDO)
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

const API_URL = 'http://localhost:5000/api';

const obtenerHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

export const registrarVenta = async (datosVenta) => {
  try {
    // datosVenta ya debe venir con los productos en el formato correcto
    // desde componentPago usando obtenerItemsParaVenta()
    console.log('Enviando solicitud a:', `${API_URL}/ventas`);
    console.log('Datos:', datosVenta);
    
    const respuesta = await axios.post(
      `${API_URL}/ventas`,
      datosVenta,
      obtenerHeaders()
    );
    
    console.log('Respuesta exitosa:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error('Error en registrarVenta:', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('No response:', error.request);
      throw { error: 'sin_respuesta', mensaje: 'No se pudo conectar con el servidor' };
    } else {
      console.error('Error config:', error.message);
      throw { error: 'error_configuracion', mensaje: error.message };
    }
  }
};

export const obtenerVentas = async (filtros = {}) => {
  try {
    const respuesta = await axios.get(
      `${API_URL}/ventas`,
      { ...obtenerHeaders(), params: filtros }
    );
    return respuesta.data;
  } catch (error) {
    console.error('Error en obtenerVentas:', error);
    throw error.response?.data || { error: 'Error al obtener ventas' };
  }
};