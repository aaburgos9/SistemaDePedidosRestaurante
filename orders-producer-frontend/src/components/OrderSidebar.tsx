import { useState } from "react";
import { formatCOP } from '../utils/currency';
import type { Order, OrderItem } from '../types/order';

interface OrderSidebarProps {
	order: Order;
	onChangeQty: (productId: number, delta: number) => void;
	total: number;
	onSend: (table: string, clientName: string) => void;
	onAddNote: (productId: number, note: string) => void;
}

export default function OrderSidebar({ order, onChangeQty, total, onSend, onAddNote }: OrderSidebarProps) {

	// nuevo estado controlado para la mesa
	const [table, setTable] = useState("Mesa 5");

	// estado para el nombre del cliente
	const [clientName, setClientName] = useState("");

	// estado para modal de especificación
	const [editingId, setEditingId] = useState<number | null>(null);
	const [tempNote, setTempNote] = useState("");

	const openSpec = (item: OrderItem) => {
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
				<div className="table-field">
					<span className="badge">Cliente</span>
					<input
						className="table-input"
						value={clientName}
						onChange={(e) => setClientName(e.target.value)}
						placeholder="Nombre del cliente"
					/>
				</div>

				<div className="table-field">
					<span className="badge">Mesa</span>
					<input
						className="table-input"
						value={table}
						onChange={(e) => setTable(e.target.value)}
					/>
				</div>
			</div>

			<h3 className="section-title">Productos: lista</h3>

			<div className="items">
			{order.items.length === 0 && <div className="empty">No hay productos</div>}
			{order.items.map((it: OrderItem) => (
					<div className="order-item" key={it.id}>
						<div className="item-left">
							<div className="qty">{it.qty}x</div>
							<div className="name">
								{it.name}
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
				<div className="total">Total: {formatCOP(total)}</div>
				<button
					className="send-btn"
					onClick={() => onSend && onSend(table, clientName)}
					disabled={order.items.length === 0}
				>
					Enviar pedido
				</button>
			</div>

			{editingId != null && (
				<div className="spec-modal-backdrop" role="dialog" aria-modal="true">
					<div className="spec-modal">
						<h4>Especificar producto</h4>
						<textarea
							className="spec-textarea"
							value={tempNote}
							onChange={(e) => setTempNote(e.target.value)}
							placeholder="Agregar observaciones"
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
