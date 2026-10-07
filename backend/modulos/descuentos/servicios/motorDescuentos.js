class EstrategiaDescuentoBase {
  aplicar(regla, productosCarrito) {
    throw new Error('Método aplicar debe ser implementado');
  }
}

class EstrategiaXmasYGratis extends EstrategiaDescuentoBase {
  aplicar(regla, productosCarrito) {
    const { productoBase, cantidadRequerida, productoBeneficiado } = regla;
    
    const productoBaseEnCarrito = productosCarrito.find(p => p.productoId.equals(productoBase));
    const productoGratisEnCarrito = productosCarrito.find(p => p.productoId.equals(productoBeneficiado));
    
    if (!productoBaseEnCarrito || !productoGratisEnCarrito) return 0;
    
    const cantidadGratis = Math.floor(productoBaseEnCarrito.cantidad / cantidadRequerida);
    const descuento = Math.min(cantidadGratis, productoGratisEnCarrito.cantidad) * productoGratisEnCarrito.precioUnitario;
    
    return descuento;
  }
}

class EstrategiaComboCruzado extends EstrategiaDescuentoBase {
  aplicar(regla, productosCarrito) {
    const { productoBase, productoBeneficiado, cantidadRequerida, unidadPaquete } = regla;
    const porcentajeDescuento = regla.escalonPorcentaje?.[0]?.porcentaje || 15;
    
    const productoBaseEnCarrito = productosCarrito.find(p => p.productoId.equals(productoBase));
    const productoComboEnCarrito = productosCarrito.find(p => p.productoId.equals(productoBeneficiado));
    
    if (!productoBaseEnCarrito || !productoComboEnCarrito) return 0;
    
    const paquetesCompletos = Math.min(
      Math.floor(productoBaseEnCarrito.cantidad / cantidadRequerida),
      Math.floor(productoComboEnCarrito.cantidad / unidadPaquete)
    );
    
    const descuento = paquetesCompletos * (productoComboEnCarrito.precioUnitario * unidadPaquete * (porcentajeDescuento / 100));
    
    return descuento;
  }
}

class EstrategiaPorcentajeProgresivo extends EstrategiaDescuentoBase {
  aplicar(regla, productosCarrito) {
    const { productoBase, escalonPorcentaje } = regla;
    
    const productoEnCarrito = productosCarrito.find(p => p.productoId.equals(productoBase));
    if (!productoEnCarrito) return 0;
    
    let porcentajeAplicar = 0;
    for (const escalon of escalonPorcentaje) {
      if (productoEnCarrito.cantidad >= escalon.cantidadMinima) {
        porcentajeAplicar = escalon.porcentaje;
      } else {
        break;
      }
    }
    
    const descuento = productoEnCarrito.precioUnitario * productoEnCarrito.cantidad * (porcentajeAplicar / 100);
    return descuento;
  }
}

class MotorDescuentos {
  constructor() {
    this.estrategias = {
      'x_mas_y_gratis': new EstrategiaXmasYGratis(),
      'combo_cruzado': new EstrategiaComboCruzado(),
      'porcentaje_progresivo_por_paquete': new EstrategiaPorcentajeProgresivo()
    };
  }
  
  calcularDescuentos(reglasActivas, productosCarrito) {
    let descuentoTotal = 0;
    const desgloseDescuentos = [];
    
    for (const regla of reglasActivas) {
      if (!regla.activo) continue;
      
      const estrategia = this.estrategias[regla.tipo];
      if (estrategia) {
        const descuento = estrategia.aplicar(regla, productosCarrito);
        if (descuento > 0) {
          descuentoTotal += descuento;
          desgloseDescuentos.push({
            reglaId: regla._id,
            nombre: regla.nombre,
            tipo: regla.tipo,
            descuentoAplicado: descuento
          });
        }
      }
    }
    
    return { descuentoTotal, desgloseDescuentos };
  }
}

export default new MotorDescuentos();