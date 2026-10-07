// frontend/src/store/useCarritoStore.js (VERSIÓN COMPLETA Y CORREGIDA)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      agregarItem: (producto, cantidad = 1, tipo = 'unidad') => {
        const { items } = get();
        
        let precioUnitario = producto.precioUnitario;
        let nombreMostrar = producto.nombre;
        let unidadesPorItem = 1;
        let stockAUsar = producto.stockVitrina;
        
        if (tipo === 'pack') {
          precioUnitario = producto.precioPack || producto.precioUnitario * producto.unidadesPorPack;
          nombreMostrar = `${producto.nombre} (Pack ${producto.unidadesPorPack} pzas)`;
          unidadesPorItem = producto.unidadesPorPack;
          stockAUsar = Math.floor(producto.stockVitrina / producto.unidadesPorPack);
        }
        
        const itemExistente = items.find(item => item.productoId === producto._id && item.tipo === tipo);
        
        if (itemExistente) {
          const nuevaCantidad = itemExistente.cantidad + cantidad;
          set({
            items: items.map(item =>
              item.productoId === producto._id && item.tipo === tipo
                ? { 
                    ...item, 
                    cantidad: nuevaCantidad, 
                    totalItem: nuevaCantidad * precioUnitario
                  }
                : item
            )
          });
        } else {
          set({
            items: [...items, {
              productoId: producto._id,
              nombre: nombreMostrar,
              precioUnitario: precioUnitario,
              cantidad: cantidad,
              totalItem: precioUnitario * cantidad,
              tipo: tipo,
              unidadesPorItem: unidadesPorItem,
              stockDisponible: stockAUsar
            }]
          });
        }
      },
      
      eliminarItem: (productoId, tipo = 'unidad') => {
        set({ items: get().items.filter(item => !(item.productoId === productoId && item.tipo === tipo)) });
      },
      
      actualizarCantidad: (productoId, cantidad, tipo = 'unidad') => {
        set({
          items: get().items.map(item =>
            item.productoId === productoId && item.tipo === tipo
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
      
      obtenerItemsParaVenta: () => {
        const items = get().items;
        const productosVenta = [];
        
        items.forEach(item => {
          if (item.tipo === 'pack') {
            productosVenta.push({
              productoId: item.productoId,
              cantidad: item.cantidad * item.unidadesPorItem,
              nombre: item.nombre.replace(/\s\(Pack.*\)/, ''),
              precioUnitario: item.precioUnitario / item.unidadesPorItem,
              esPack: true,
              packsVendidos: item.cantidad,
              unidadesPorPack: item.unidadesPorItem
            });
          } else {
            productosVenta.push({
              productoId: item.productoId,
              cantidad: item.cantidad,
              nombre: item.nombre,
              precioUnitario: item.precioUnitario,
              esPack: false
            });
          }
        });
        
        return productosVenta;
      }
    }),
    {
      name: 'carrito-storage',
    }
  )
);