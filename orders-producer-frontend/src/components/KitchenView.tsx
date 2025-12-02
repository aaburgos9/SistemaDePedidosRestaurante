import { useKitchenWebSocket } from '../hooks/useKitchenWebSocket';
import { formatCOP } from '../utils/currency';
import type { OrderStatus } from '../types/order';

export const KitchenView = () => {
  const { pedidos, cambiarEstado } = useKitchenWebSocket();

  const obtenerColorEstado = (estado: OrderStatus): string => {
    switch (estado) {
      case 'pendiente':
        return '#ff4444';
      case 'en-preparacion':
        return '#ffaa00';
      case 'listo':
        return '#44cc44';
      default:
        return '#ccc';
    }
  };

  if (pedidos.length === 0) {
    return null;
  }

  return (
    <div className="kitchen-container">
      {/* Header */}
      <header className="kitchen-header">
        <div className="logo-section">
          <div className="logo-icon">🌭</div>
          <div className="logo-text">
            <div className="logo-title">RÁPIDO</div>
            <div className="logo-subtitle">Y SABROSO</div>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn">📋</button>
          <button className="icon-btn">➕</button>
        </div>
      </header>

      {/* Grid de pedidos */}
      <div className="pedidos-grid">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="pedido-card">
            {/* Encabezado del pedido */}
            <div className="pedido-header">
              <h2 className="pedido-numero">Pedido #{pedido.id}</h2>
              <div
                className="estado-indicator"
                style={{
                  backgroundColor: obtenerColorEstado(pedido.estado)
                }}
              />
            </div>

            {/* Mesa + cliente */}
            <div className="mesa-info">
              <span className="mesa-badge">{pedido.mesa}</span>
              <span className="mesa-label">
                {pedido.mesa}
                {pedido.cliente ? ` • ${pedido.cliente}` : ''}
              </span>
            </div>

            {/* Contenido principal */}
            <div className="pedido-content">
              {/* Productos */}
              <div className="productos-section">
                <h3 className="section-title">Productos</h3>
                <div className="productos-list">
                  {pedido.productos.map((producto, idx) => (
                    <div key={idx} className="producto-item">
                      <span>
                        {producto.cantidad}x {producto.nombre}
                      </span>
                      <span className="producto-precio">
                        {formatCOP(producto.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Especificaciones */}
              <div className="especificaciones-section">
                <h3 className="section-title">Especificaciones</h3>
                <div className="especificaciones-list">
                  {pedido.especificaciones && pedido.especificaciones.length > 0 ? (
                    pedido.especificaciones.map((esp, idx) => (
                      <div key={idx} className="especificacion-item">
                        - {esp}
                      </div>
                    ))
                  ) : (
                    <div className="especificacion-item">
                      - Sin especificaciones -
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total + Botones de acción */}
            <div className="pedido-total">Total: {formatCOP(pedido.total)}</div>

            <div className="pedido-actions">
              {pedido.estado === 'pendiente' && (
                <button
                  className="btn-action btn-preparar"
                  onClick={() => cambiarEstado(pedido.id, 'en-preparacion')}
                >
                  Iniciar Preparación
                </button>
              )}
              {pedido.estado === 'en-preparacion' && (
                <button
                  className="btn-action btn-listo"
                  onClick={() => cambiarEstado(pedido.id, 'listo')}
                >
                  Marcar como Listo
                </button>
              )}
              {pedido.estado === 'listo' && (
                <div className="estado-listo">✓ Pedido Listo para Entregar</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
