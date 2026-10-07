import React, { useState, useEffect } from 'react';

const ComponenteAlerta = ({ tipo = 'info', mensaje, duracion = 5000, onCerrar }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duracion > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onCerrar?.();
      }, duracion);
      return () => clearTimeout(timer);
    }
  }, [duracion, onCerrar]);

  if (!visible) return null;

  const colores = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-celeste bg-opacity-20 border-celeste text-celeste'
  };

  const iconos = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`${colores[tipo]} border-l-4 p-4 rounded-lg shadow-lg animate-fadeInRight`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconos[tipo]}</span>
          <p className="font-medium">{mensaje}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onCerrar?.();
          }}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ComponenteAlerta;