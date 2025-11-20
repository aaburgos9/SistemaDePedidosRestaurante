import React from "react";

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="card">
      {/* reemplazamos el placeholder por una img con fallback */}
      <div className="img-placeholder">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
            onError={(e) => {
              // si falla la carga, ocultar la imagen para mostrar fondo gris
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
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
