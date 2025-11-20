import React, { useState } from "react";

export default function OrderSidebar({ order, onChangeQty, total, onSend, onAddNote }) {
	// nuevo estado controlado para la mesa
	const [table, setTable] = useState("Mesa 5");

	// estado para modal de especificación
	const [editingId, setEditingId] = useState(null);
	const [tempNote, setTempNote] = useState("");

	const openSpec = (item) => {
		setEditingId(item.id);
		setTempNote(item.note || "");
	};
	const closeSpec = () => {
		setEditingId(null);
		setTempNote("");
	};
	const saveSpec = () => {
		if (onAddNote && editingId != null) onAddNote(editingId, tempNote.trim());
		closeSpec();
	};

	return (
		<aside className="order">
			<div className="table-select">
				<span className="badge">Mesa</span>
				<input
					className="table-input"
					value={table}
					onChange={(e) => setTable(e.target.value)}
				/>
			</div>

			<h3 className="section-title">Productos: lista</h3>

			<div className="items">
				{order.items.length === 0 && <div className="empty">No hay productos</div>}
				{order.items.map((it) => (
					<div className="order-item" key={it.id}>
						<div className="item-left">
							<div className="qty">{it.qty}x</div>
							<div className="name">
								{it.name}
								{/* mostrar nota si existe */}
								{it.note && <div className="note-preview">• {it.note}</div>}
							</div>
						</div>
						<div className="item-controls">
							<button className="ctrl" onClick={() => onChangeQty(it.id, -1)}>-</button>
							<button className="ctrl" onClick={() => onChangeQty(it.id, +1)}>+</button>
							<button className="spec" onClick={() => openSpec(it)}>Especificar</button>
						</div>
					</div>
				))}
			</div>

			<div className="order-footer">
				<div className="total">Total: ${total.toFixed(2)}</div>
				<button
					className="send-btn"
					onClick={() => onSend(table)}
					disabled={order.items.length === 0}
				>
					Enviar pedido
				</button>
			</div>

			{/* modal simple para especificaciones */}
			{editingId != null && (
				<div className="spec-modal-backdrop" role="dialog" aria-modal="true">
					<div className="spec-modal">
						<h4>Especificar producto</h4>
						<textarea
							className="spec-textarea"
							value={tempNote}
							onChange={(e) => setTempNote(e.target.value)}
							placeholder="Agregar observaciones (ej. sin cebolla, doble queso...)"
						/>
						<div className="spec-actions">
							<button className="ctrl" onClick={closeSpec}>Cancelar</button>
							<button className="send-btn" onClick={saveSpec}>Guardar</button>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}
