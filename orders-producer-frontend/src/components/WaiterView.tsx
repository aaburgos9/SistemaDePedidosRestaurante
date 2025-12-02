import { useState } from 'react';
import ProductCard from './ProductCard';
import OrderSidebar from './OrderSidebar';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useOrderSubmission } from '../hooks/useOrderSubmission';
import type { Product, OrderPayload } from '../types/order';

const initialProducts: Product[] = [
  { id: 1, name: "Hamburguesa",    price: 10500, desc: "Hamburguesa", image: "/images/hamburguesa.jpg" },
  { id: 2, name: "Papas fritas",   price: 12000, desc: "Papas",       image: "/images/papas.jpg" },
  { id: 3, name: "Perro caliente", price: 8000,  desc: "Perro",       image: "/images/perro.jpg" },
  { id: 4, name: "Refresco",       price: 7000,  desc: "Refresco",    image: "/images/refresco.jpg" }
];

export const WaiterView = () => {
  const [products] = useState<Product[]>(initialProducts);
  const { order, addToOrder, changeQty, addNoteToItem, total, clearOrder } = useOrderManagement();
  const { submitOrder, successMsg } = useOrderSubmission();

  const handleSend = async (table: string, clientName: string) => {
    if (order.items.length === 0) return;

    const customerName = clientName?.trim() || "Cliente sin nombre";

    const payload: OrderPayload = {
      customerName,
      table,
      items: order.items.map((it: { name: string; qty: number; price: number; note?: string }) => ({
        productName: it.name,
        quantity: it.qty,
        unitPrice: it.price,
        note: it.note || null
      }))
    };

    const success = await submitOrder(payload);
    
    if (success) {
      clearOrder();
    }
  };

  return (
    <div className="page">
      <div className="tablet">
        <header className="tablet-header">
          <div className="brand">
            <div className="logo">🍔</div>
            <div>
              <div className="title">RÁPIDO</div>
              <div className="subtitle">Y SABROSO</div>
            </div>
          </div>
          <div className="menu">MENÚ</div>
        </header>

        <div className="tablet-body">
          <OrderSidebar
            order={order}
            onChangeQty={changeQty}
            total={total}
            onSend={handleSend}
            onAddNote={addNoteToItem}
          />

          <main className="product-area">
            <div className="product-grid">
              {products.map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={() => addToOrder(p)}
                />
              ))}
            </div>
          </main>
        </div>

        {/* toast de éxito */}
        {successMsg && <div className="toast">{successMsg}</div>}
      </div>
    </div>
  );
};
