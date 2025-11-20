import React from "react";

export default function OrderSidebar({ order, onChangeQty, total, onSend }) {
  return (
    <aside className="order">
      <div className="table-select">
        <span className="badge">Mesa</span>
        <input className="table-input" defaultValue="Mesa 5" />
      </div>

      <h3 className="section-title">Productos: lista</h3>

      <div className="items">
        {order.items.length === 0 && <div className="empty">No hay productos</div>}
        {order.items.map((it) => (
          <div className="order-item" key={it.id}>
            <div className="item-left">
              <div className="qty">{it.qty}x</div>
              <div className="name">{it.name}</div>
            </div>
            <div className="item-controls">
              <button className="ctrl" onClick={() => onChangeQty(it.id, -1)}>-</button>
              <button className="ctrl" onClick={() => onChangeQty(it.id, +1)}>+</button>
              <button className="spec">Especificar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="order-footer">
        <div className="total">Total: ${total.toFixed(2)}</div>
        <button className="send-btn" onClick={onSend}>Enviar pedido</button>
      </div>
    </aside>
  );
}
