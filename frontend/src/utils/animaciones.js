// Utilidades de animación para componentes

export const animaciones = {
  // Animación de entrada para tarjetas
  tarjeta: (indice = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: indice * 0.05, duration: 0.4 }
  }),

  // Animación para modales
  modal: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },

  // Animación para listas
  listaItem: (indice = 0) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: indice * 0.03, duration: 0.3 }
  }),

  // Animación para notificaciones
  notificacion: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3 }
  },

  // Animación de pulso para botones importantes
  pulso: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  }
};

// Función para mostrar notificaciones toast
export const mostrarNotificacion = (mensaje, tipo = 'info', duracion = 3000) => {
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${tipo}`;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xl">${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${mensaje}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duracion);
};

// Función para efecto de carga esquelético
export const SkeletonLoader = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div 
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
    />
  );
};