import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import OrderSidebar from '../components/OrderSidebar';
import { EditOrderDialog } from '../components/EditOrderDialog';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useOrderSubmission } from '../hooks/useOrderSubmission';
import { useActiveOrders } from '../hooks/useActiveOrders';
import type { ActiveOrder } from '../hooks/useActiveOrders';
import { updateOrder } from '../services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, Pencil } from 'lucide-react';
import type { Product, OrderPayload } from '../types/order';

const initialProducts: Product[] = [
  { id: 1, name: "Hamburguesa",    price: 10500, desc: "Hamburguesa", image: "/images/burguer_pic.jpg" },
  { id: 2, name: "Papas fritas",   price: 12000, desc: "Papas",       image: "/images/fries_pic.jpg" },
  { id: 3, name: "Perro caliente", price: 8000,  desc: "Perro",       image: "/images/hotdog_pic.jpg" },
  { id: 4, name: "Refresco",       price: 7000,  desc: "Refresco",    image: "/images/drink_pic.jpg" }
];

type OrderStatusFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'completed';
type MenuCategory = 'all' | 'main-course' | 'appetizers' | 'soups' | 'salads' | 'drinks';

const ORDER_STATUS_FILTERS: { value: OrderStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
];


const STATUS_CONFIG = {
  ready: { color: 'bg-green-500 hover:bg-green-600', text: 'Ready' },
  preparing: { color: 'bg-blue-500 hover:bg-blue-600', text: 'Preparing' },
  pending: { color: 'bg-orange-500 hover:bg-orange-600', text: 'Pending' },
  completed: { color: 'bg-gray-500 hover:bg-gray-600', text: 'Completed' },
} as const;

export function WaiterPage() {
  const [products] = useState<Product[]>(initialProducts);
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>('all');
  const [menuCategory, setMenuCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState<ActiveOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { order, addToOrder, changeQty, addNoteToItem, total, clearOrder } = useOrderManagement();
  const { submitOrder, successMsg } = useOrderSubmission();
  const { activeOrders, loading: ordersLoading, refetch: refetchOrders } = useActiveOrders();

  // Refetch orders after successful order submission
  useEffect(() => {
    if (successMsg && successMsg.includes('enviado')) {
      setTimeout(() => {
        refetchOrders();
      }, 1000);
    }
  }, [successMsg, refetchOrders]);

  const handleSend = async (table: string, clientName: string) => {
    if (order.items.length === 0) return;

    const customerName = clientName?.trim() || "Cliente sin nombre";

    const payload: OrderPayload = {
      customerName,
      table,
      items: order.items.map((it) => ({
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditOrder = (order: ActiveOrder) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setTimeout(() => setEditingOrder(null), 200);
  };

  const handleSaveOrder = async (
    orderId: string,
    updates: {
      customerName: string;
      table: string;
      items: {
        productName: string;
        quantity: number;
        unitPrice: number;
        note?: string | null;
      }[];
    }
  ): Promise<boolean> => {
    try {
      const response = await updateOrder(orderId, updates);
      
      if (response.success) {
        // Refresh orders to show changes
        await refetchOrders();
        return true;
      } else {
        console.error('Update failed:', response.error || response.message);
        throw new Error(response.error?.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Active Orders Section */}
        <div className="bg-white border-b px-6 py-3 pt-9">
          <div className="flex items-center gap-6 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Track Order</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchOrders}
                disabled={ordersLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="flex gap-2">
              {ORDER_STATUS_FILTERS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={orderStatus === value ? 'default' : 'outline'}
                  onClick={() => setOrderStatus(value)}
                  className="rounded-full h-8 px-3 text-xs"
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

    
          <div className="flex gap-3 overflow-x-auto pb-2">
            {ordersLoading && activeOrders.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No active orders</div>
            ) : (
              activeOrders
                .filter(order => orderStatus === 'all' || order.status === orderStatus)
                .map((order) => {
                const { color, text } = STATUS_CONFIG[order.status];
                const isEditable = order.status === 'pending';
                return (
                  <div 
                    key={order.fullId} 
                    className="shrink-0 bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors border border-gray-200 relative group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{order.table}</p>
                        <p className="text-xs text-gray-500">{order.id}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <Badge 
                        className={`${color} text-white h-5 px-2 text-xs whitespace-nowrap`}
                        variant="secondary"
                      >
                        {text}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{order.timeRemaining}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span className="font-medium">{order.itemCount}</span>
                        <span className="text-gray-400">items</span>
                      </div>
                      {isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit order"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto px-6 py-12">

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const itemInCart = order.items.find(item => item.id === product.id);
              const quantity = itemInCart?.qty || 0;
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToOrder}
                  quantity={quantity}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Sidebar */}
      <div className="w-96 bg-white border-l shadow-lg">
        <OrderSidebar
          order={order}
          total={total}
          onChangeQty={changeQty}
          onAddNote={addNoteToItem}
          onSend={handleSend}
          successMsg={successMsg}
        />
      </div>

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={editingOrder}
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveOrder}
        availableProducts={products}
      />
    </div>
  );
}
