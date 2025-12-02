export interface Product {
  id: number;
  name: string;
  price: number;
  desc: string;
  image: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

export interface Order {
  items: OrderItem[];
}

export type OrderStatus = 'pendiente' | 'en-preparacion' | 'listo';

export interface ProductoItem {
  nombre: string;
  cantidad: number;
  unitPrice: number;
  subtotal: number;
  note: string | null;
}

export interface Pedido {
  id: string;
  mesa: string;
  cliente: string;
  productos: ProductoItem[];
  especificaciones: string[];
  total: number;
  estado: OrderStatus;
}

export interface OrderPayload {
  customerName: string;
  table: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    note: string | null;
  }[];
}

export interface KitchenOrderMessage {
  id: string;
  customerName: string;
  table: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    note?: string;
  }[];
}
