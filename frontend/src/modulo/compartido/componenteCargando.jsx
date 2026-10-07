import React from 'react';

const ComponenteCargando = ({ texto = 'Cargando...', tipo = 'spinner' }) => {
  if (tipo === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-celeste border-t-transparent rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-celeste rounded-full animate-pulse-fast"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 animate-pulse-fast">{texto}</p>
      </div>
    );
  }

  if (tipo === 'skeleton') {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 w-full rounded-lg"></div>
        <div className="skeleton h-20 w-full rounded-lg"></div>
        <div className="skeleton h-20 w-full rounded-lg"></div>
        <div className="skeleton h-32 w-full rounded-lg"></div>
      </div>
    );
  }

  if (tipo === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-celeste rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-celeste rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-celeste rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="mt-4 text-gray-600">{texto}</p>
      </div>
    );
  }

  return null;
};

export default ComponenteCargando;