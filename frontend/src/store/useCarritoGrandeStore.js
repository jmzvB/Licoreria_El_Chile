import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCarritoGrandeStore = create(
  persist(
    (set, get) => ({
      items: [],
      tipoCliente: 'mostrador',
      
      agregarItem: (producto, cantidad = 1, tipoPrecio = 'menudeo') => {
        const { items } = get();
        const precio = tipoPrecio === 'mayoreo' && producto.precioMayoreo 
          ? producto.precioMayoreo 
          : producto.precioUnitario;
        
        const itemExistente = items.find(item => item.productoId === producto._id);
        
        if (itemExistente) {
          const nuevaCantidad = itemExistente.cantidad + cantidad;
          set({
            items: items.map(item =>
              item.productoId === producto._id
                ? { 
                    ...item, 
                    cantidad: nuevaCantidad, 
                    totalItem: nuevaCantidad * precio
                  }
                : item
            )
          });
        } else {
          set({
            items: [...items, {
              productoId: producto._id,
              nombre: producto.nombre,
              precioUnitario: precio,
              cantidad: cantidad,
              totalItem: precio * cantidad,
              tipoPrecio: tipoPrecio,
              stockAlmacen: producto.stockAlmacen
            }]
          });
        }
      },
      
      eliminarItem: (productoId) => {
        set({ items: get().items.filter(item => item.productoId !== productoId) });
      },
      
      actualizarCantidad: (productoId, cantidad) => {
        set({
          items: get().items.map(item =>
            item.productoId === productoId
              ? { 
                  ...item, 
                  cantidad, 
                  totalItem: cantidad * item.precioUnitario 
                }
              : item
          )
        });
      },
      
      vaciarCarrito: () => {
        set({ items: [] });
      },
      
      obtenerTotal: () => {
        const items = get().items;
        const total = items.reduce((sum, item) => sum + (item.totalItem || 0), 0);
        return isNaN(total) ? 0 : total;
      },
      
      obtenerCantidadTotal: () => {
        return get().items.reduce((sum, item) => sum + item.cantidad, 0);
      },
      
      setTipoCliente: (tipo) => {
        set({ tipoCliente: tipo });
      }
    }),
    {
      name: 'carrito-grande-storage',
    }
  )
);