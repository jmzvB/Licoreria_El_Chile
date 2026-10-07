import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { iniciarSesion as apiIniciarSesion, cerrarSesion as apiCerrarSesion } from '../modulo/auth/servicioAuth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      refreshToken: null,
      
      iniciarSesion: async (email, contrasenia) => {
        try {
          const respuesta = await apiIniciarSesion(email, contrasenia);
          set({
            usuario: respuesta.usuario,
            token: respuesta.tokens.acceso,
            refreshToken: respuesta.tokens.refresco
          });
          return { exito: true };
        } catch (error) {
          return { exito: false, error: error.message };
        }
      },
      
      cerrarSesion: () => {
        apiCerrarSesion();
        set({ usuario: null, token: null, refreshToken: null });
      },
      
      tieneRol: (rolesPermitidos) => {
        const { usuario } = get();
        return usuario && rolesPermitidos.includes(usuario.rol);
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);