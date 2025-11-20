import React, { useState } from "react";
import ProductCard from "./components/ProductCard";
import OrderSidebar from "./components/OrderSidebar";

const initialProducts = [
	{ id: 1, name: "Hamburguesa", price: 5.5, desc: "Hamburguesa", image: "/images/hamburguesa.jpg" },
	{ id: 2, name: "Papas fritas", price: 2.5, desc: "Papas", image: "/images/papas.jpg" },
	{ id: 3, name: "Cheeseburger", price: 6.0, desc: "Cheeseburger", image: "/images/cheeseburger.jpg" },
	{ id: 4, name: "Refresco", price: 1.8, desc: "Refresco", image: "/images/refresco.jpg" }
];

export default function App() {
	const [products] = useState(initialProducts);
	const [order, setOrder] = useState({ items: [] });
	const [successMsg, setSuccessMsg] = useState(null);

	const addToOrder = (product) => {
		setOrder((prev) => {
			const existing = prev.items.find((it) => it.id === product.id);
			if (existing) {
				return {
					...prev,
					items: prev.items.map((it) =>
						it.id === product.id ? { ...it, qty: it.qty + 1 } : it
					)
				};
			}
			return { ...prev, items: [...prev.items, { ...product, qty: 1 }] };
		});
	};

	const changeQty = (productId, delta) => {
		setOrder((prev) => {
			const items = prev.items
				.map((it) =>
					it.id === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it
				)
				.filter((it) => it.qty > 0);
			return { ...prev, items };
		});
	};

	// nueva función: guardar nota/especificación para un item del pedido
	const addNoteToItem = (productId, note) => {
		setOrder((prev) => {
			const items = prev.items.map((it) =>
				it.id === productId ? { ...it, note: note || undefined } : it
			);
			return { ...prev, items };
		});
	};

	const total = order.items.reduce((s, it) => s + it.price * it.qty, 0);

	const handleSend = (table) => {
		if (order.items.length === 0) return;
		setSuccessMsg(`Pedido enviado a la cocina de ${table}.`);
		setTimeout(() => {
			setOrder({ items: [] });
			setSuccessMsg(null);
		}, 2000);
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
						// pasar el nuevo handler para especificaciones
						onAddNote={addNoteToItem}
					/>

					<main className="product-area">
						<div className="product-grid">
							{products.map((p) => (
								<ProductCard key={p.id} product={p} onAdd={() => addToOrder(p)} />
							))}
						</div>
					</main>
				</div>

				{/* toast de éxito */}
				{successMsg && <div className="toast">{successMsg}</div>}
			</div>
		</div>
	);
}
