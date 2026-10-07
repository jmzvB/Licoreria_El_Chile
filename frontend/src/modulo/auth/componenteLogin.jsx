import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ComponenteLogin = () => {
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuthStore();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    const resultado = await iniciarSesion(email, contrasenia);
    
    if (resultado.exito) {
      navigate('/');
    } else {
      setError(resultado.error || 'Credenciales inválidas');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-celeste to-vino">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-celeste to-vino rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-4xl">🍷</span>
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-2">El Chile</h1>

          </div>
          
          <form onSubmit={manejarSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                placeholder="admin@licoreria.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Contraseña</label>
              <input
                type="password"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                className="input-field"
                required
                placeholder="••••••"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full py-3 text-lg"
            >
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default ComponenteLogin;