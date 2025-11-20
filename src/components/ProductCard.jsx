import React from "react";

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="card">
      <div className="img-placeholder"> </div>
      <div className="card-body">
        <div className="card-title">{product.name}</div>
        <div className="card-desc">{product.desc}</div>
        <div className="card-footer">
          <div className="price">${product.price.toFixed(2)}</div>
          <button className="add-btn" onClick={onAdd} aria-label={`Añadir ${product.name}`}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
