import { useState, useEffect } from "react";
import { formatCOP } from '../utils/currency';
import type { Product } from '../types/order';

interface ProductCardProps {
  product: Product;
  onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {


  const [failed, setFailed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<string[]>([]);

  useEffect(() => {
    setFailed(false);
    setResolvedSrc(null);
    setAttempts([]);

    const imagePath = product.image || "";
    const filename = imagePath.split("/").pop();

    // Buscar en src/assets y src/images (soporta imágenes colocadas dentro de src)
    const modules = import.meta.glob("/src/{assets,images}/**/*", { eager: true });
    const assetMap: Record<string, string> = {};
    for (const p in modules) {
      const mod = modules[p] as any;
      // puede ser string (si as:'url' usado) o módulo con default
      const url = typeof mod === "string" ? mod : (mod && mod.default) ? mod.default : mod;
      const name = p.split("/").pop();
      // si hay duplicados, mantenemos el primero (prefiere cualquiera encontrado)
      if (name && !assetMap[name]) assetMap[name] = url;
    }

    const tries = [];

    // 1) si el product.image es un nombre (ej. "hamburguesa.jpg") y existe en assetMap
    if (filename && assetMap[filename]) {
      tries.push(assetMap[filename]);
      setResolvedSrc(assetMap[filename]);
    } else {
      // 2) intentar usar la ruta proporcionada como pública (/images/...)
      const publicPath = imagePath ? (imagePath.startsWith("/") ? imagePath : `/${imagePath}`) : null;
      if (publicPath) {
        tries.push(publicPath);
        setResolvedSrc(publicPath);
      }
    }

    setAttempts(tries);
  }, [product]);

  return (
    <div className="card">
      <div className="img-placeholder">
        {resolvedSrc && !failed ? (
          <img
            src={resolvedSrc}
            alt={product.name}
            className="product-img"
            onError={() => {
              setFailed(true);
              // eslint-disable-next-line no-console
              console.warn("No se pudo cargar la imagen:", resolvedSrc, "producto:", product);
            }}
          />
        ) : (
          <div className="img-missing">
            <div className="missing-emoji">📷</div>
            <div className="missing-text">Imagen no disponible</div>
            {attempts.length > 0 ? (
              <div className="missing-path">{attempts.join("  •  ")}</div>
            ) : (
              <div className="missing-path">Ninguna ruta configurada para este producto</div>
            )}
          </div>
        )}
      </div>

      <div className="card-body">
        <div className="card-title">{product.name}</div>
        <div className="card-desc">{product.desc}</div>
        <div className="card-footer">
          <div className="price">{formatCOP(product.price)}</div>
          <button className="add-btn" onClick={onAdd} aria-label={`Añadir ${product.name}`}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
