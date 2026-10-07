// frontend/src/modulo/compartido/componenteNavbar.jsx (VERIFICAR)
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ComponenteNavbar = () => {
  const { usuario, cerrarSesion } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  const esAdmin = usuario?.rol === 'admin';
  const esVendedor = usuario?.rol === 'vendedor';

  const estaActivo = (path) => location.pathname === path;

  // Si no hay usuario, no mostrar navbar
  if (!usuario) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link to={esAdmin ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl">🍷</span>
            <span className="text-xl font-bold text-gradient">El Chile</span>
          </Link>
          
          <div className="flex items-center gap-4 flex-wrap">
            {esVendedor && (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-1 rounded-lg transition ${estaActivo('/') ? 'text-celeste font-semibold' : 'text-gray-600 hover:text-celeste'}`}
                >
                  Ventas
                </Link>
                <Link 
                  to="/productos" 
                  className={`px-3 py-1 rounded-lg transition ${estaActivo('/productos') ? 'text-celeste font-semibold' : 'text-gray-600 hover:text-celeste'}`}
                >
                  Productos
                </Link>
              </>
            )}
            {esAdmin && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-1 rounded-lg transition ${estaActivo('/dashboard') ? 'text-celeste font-semibold' : 'text-gray-600 hover:text-celeste'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/productos" 
                  className={`px-3 py-1 rounded-lg transition ${estaActivo('/productos') ? 'text-celeste font-semibold' : 'text-gray-600 hover:text-celeste'}`}
                >
                  Productos
                </Link>
                <Link 
                  to="/reservas" 
                  className={`px-3 py-1 rounded-lg transition ${estaActivo('/reservas') ? 'text-celeste font-semibold' : 'text-gray-600 hover:text-celeste'}`}
                >
                  Reservas
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
              <div className="w-8 h-8 bg-gradient-to-br from-celeste to-vino rounded-full flex items-center justify-center text-white text-sm font-bold">
                {usuario?.nombreCompleto?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-gray-700 hidden md:block">
                {usuario?.nombreCompleto?.split(' ')[0]}
              </span>
            </div>
            <button 
              onClick={manejarCerrarSesion} 
              className="text-gray-600 hover:text-red-500 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ComponenteNavbar;