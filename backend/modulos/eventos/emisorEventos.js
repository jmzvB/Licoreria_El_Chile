class EmisorEventos {
  constructor() {
    this.observadores = new Map();
  }
  
  registrar(evento, observador) {
    if (!this.observadores.has(evento)) {
      this.observadores.set(evento, []);
    }
    this.observadores.get(evento).push(observador);
  }
  
  async emitir(evento, datos) {
    if (!this.observadores.has(evento)) return;
    
    const promesas = this.observadores.get(evento).map(async (observador) => {
      try {
        await observador.ejecutar(datos);
      } catch (error) {
        console.error(`Error en observador de ${evento}:`, error.message);
      }
    });
    
    await Promise.all(promesas);
  }
}

const emisorEventos = new EmisorEventos();

// Observador para actualizar reportes
class ObservadorReportes {
  async ejecutar(datos) {
    console.log(`📊 Evento recibido:`, datos);
    // Aquí se integraría con sistema de reportes
  }
}

// Observador para notificaciones de stock bajo
class ObservadorStockBajo {
  async ejecutar(datos) {
    console.log(`⚠️ Alerta de stock bajo:`, datos);
    // Aquí se enviarían notificaciones al admin
  }
}

emisorEventos.registrar('ventaConfirmada', new ObservadorReportes());
emisorEventos.registrar('stockActualizado', new ObservadorStockBajo());

export default emisorEventos;