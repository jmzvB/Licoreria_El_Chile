// frontend/src/App.jsx (CORREGIDO - Rutas correctas)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import ComponenteLogin from './modulo/auth/componenteLogin';
import ComponentePos from './modulo/ventas/componentePos';
import ComponenteListaProductos from './modulo/productos/componenteListaProductos';
import ComponenteProtegido from './modulo/compartido/componenteProtegido';
import ComponenteNavbar from './modulo/compartido/componenteNavbar';
import ComponentePanelReservas from './modulo/reservas/componentePanelReservas';
import ComponenteDashboard from './modulo/dashboard/componenteDashboard';

function App() {
  const { token, usuario } = useAuthStore();
  const esAdmin = usuario?.rol === 'admin';
  const esVendedor = usuario?.rol === 'vendedor';

  // Si no hay token, mostrar login
  if (!token) {
    return (
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <main>
            <Routes>
              <Route path="/login" element={<ComponenteLogin />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  // Si hay token, mostrar app con navbar según rol
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ComponenteNavbar />
        <main className="pt-20">
          <Routes>
            {/* Admin solo ve dashboard */}
            {esAdmin && (
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <ComponenteProtegido rolesPermitidos={['admin']}>
                    <ComponenteDashboard />
                  </ComponenteProtegido>
                } />
                <Route path="/productos" element={
                  <ComponenteProtegido rolesPermitidos={['admin']}>
                    <ComponenteListaProductos />
                  </ComponenteProtegido>
                } />
                <Route path="/reservas" element={
                  <ComponenteProtegido rolesPermitidos={['admin']}>
                    <ComponentePanelReservas />
                  </ComponenteProtegido>
                } />
              </>
            )}
            
            {/* Vendedor solo ve POS */}
            {esVendedor && (
              <>
                <Route path="/" element={
                  <ComponenteProtegido rolesPermitidos={['vendedor']}>
                    <ComponentePos />
                  </ComponenteProtegido>
                } />
                <Route path="/productos" element={
                  <ComponenteProtegido rolesPermitidos={['vendedor']}>
                    <ComponenteListaProductos />
                  </ComponenteProtegido>
                } />
              </>
            )}
            
            {/* Ruta por defecto según rol */}
            <Route path="*" element={<Navigate to={esAdmin ? '/dashboard' : '/'} replace />} />
            <Route path="/login" element={<Navigate to={esAdmin ? '/dashboard' : '/'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;