import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ComponenteProtegido = ({ children, rolesPermitidos = [] }) => {
  const { token, usuario } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario?.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary mt-4"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ComponenteProtegido;