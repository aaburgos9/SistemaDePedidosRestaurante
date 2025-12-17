import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import OrderSidebar from '../components/OrderSidebar';
import { EditOrderDialog } from '../components/EditOrderDialog';
import { ViewOrderDialog } from '@/components/ViewOrderDialog';
import { ActiveOrdersTracker } from '@/components/ActiveOrdersTracker';
import { WaiterHeader } from '../components/WaiterHeader';
import { OrderReadyNotification } from '../components/OrderReadyNotification';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useOrderSubmission } from '../hooks/useOrderSubmission';
import { useActiveOrders } from '../hooks/useActiveOrders';
import type { ActiveOrder } from '../hooks/useActiveOrders';
import { updateOrder, updateOrderStatus } from '../services/orderService';
import type { Product, OrderPayload } from '../types/order';
import { useWebSocket } from '@/hooks/useWebSocket';
import { fetchActiveProducts } from '../services/adminService';
import { fetchPublicCategories } from '../services/categoryService';

type OrderStatusFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'completed';

interface Category {
  _id: string;
  name: string;
}

export function WaiterPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>('all');
  const [searchQuery] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<ActiveOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<ActiveOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [readyOrder, setReadyOrder] = useState<ActiveOrder | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [snoozedOrders, setSnoozedOrders] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  
  const { order, addToOrder, changeQty, addNoteToItem, total, clearOrder } = useOrderManagement();
  const { submitOrder, successMsg } = useOrderSubmission();
  const { activeOrders, setActiveOrders, loading: ordersLoading, refetch: refetchOrders } = useActiveOrders();
  const { lastMessage } = useWebSocket();

  // Load active products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchActiveProducts();
        const dbProducts = response.data.map((p: {id: number; name: string; price: number; description?: string; image?: string; category?: string}) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          desc: p.description || '',
          image: p.image || '/images/default.jpg',
          category: p.category || 'Sin categoría'
        }));
        setProducts(dbProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchPublicCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Refetch orders after successful order submission
  useEffect(() => {
    if (successMsg && successMsg.includes('enviado')) {
      setTimeout(() => {
        refetchOrders();
      }, 1000);
    }
  }, [successMsg, refetchOrders]);

   // Listen to WebSocket messages and update orders in real-time
useEffect(() => {
  if (lastMessage) {
    console.log('📨 WebSocket message received:', JSON.stringify(lastMessage, null, 2));
    
    if (lastMessage.type === 'ORDER_STATUS_CHANGED' && lastMessage.order) {
      console.log('🔄 Order status changed, updating local state...');
      
      const updatedStatus = lastMessage.order.status;
      const orderId = lastMessage.order.id;
      
      // Actualizar el estado local directamente sin hacer HTTP request
      setActiveOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.fullId === orderId) {
            const updatedOrder = {
              ...order,
              status: updatedStatus,
              customerName: lastMessage.order.customerName,
              table: lastMessage.order.table,
            };
            
            // Si la orden cambió a "ready" y no está en la lista de pospuestas, mostrar notificación
            if (updatedStatus === 'ready' && !snoozedOrders.has(orderId)) {
              console.log('🔔 Orden lista detectada, mostrando notificación...');
              setReadyOrder(updatedOrder);
              setIsNotificationOpen(true);
            }
            
            return updatedOrder;
          }
          return order;
        })
      );
      
      console.log('✅ Local state updated without HTTP request');
    } else if (lastMessage.type === 'ORDER_NEW' && lastMessage.order) {
      console.log('🆕 New order received, refetching to get complete data...');
      refetchOrders();
    }
  }
}, [lastMessage, setActiveOrders, refetchOrders, snoozedOrders]);

  const handleSend = async (table: string, clientName: string) => {
    if (order.items.length === 0) return;

    const customerName = clientName?.trim();
    
    // Validar que el nombre del cliente no esté vacío
    if (!customerName) {
      return;
    }

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditOrder = (order: ActiveOrder) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleViewOrder = (order: ActiveOrder) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setTimeout(() => setEditingOrder(null), 200);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setTimeout(() => setViewingOrder(null), 200);
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      console.log('📦 Marcando orden como entregada:', orderId);
      const response = await updateOrderStatus(orderId, 'completed');
      
      if (response.success) {
        console.log('✅ Orden marcada como entregada exitosamente');
        setIsNotificationOpen(false);
        setReadyOrder(null);
        // Actualizar estado local
        setActiveOrders(prev => 
          prev.map(order => 
            order.fullId === orderId 
              ? { ...order, status: 'completed' } 
              : order
          )
        );
      } else {
        console.error('❌ Error al marcar orden como entregada:', response.error);
      }
    } catch (error) {
      console.error('❌ Error al marcar orden como entregada:', error);
    }
  };

  const handleSnoozeNotification = () => {
    if (readyOrder) {
      console.log('⏰ Posponiendo notificación por 30 segundos para orden:', readyOrder.fullId);
      setSnoozedOrders(prev => new Set(prev).add(readyOrder.fullId));
      setIsNotificationOpen(false);
      
      // Remover de la lista de pospuestas después de 30 segundos
      setTimeout(() => {
        console.log('🔔 Reactivando notificación para orden:', readyOrder.fullId);
        setSnoozedOrders(prev => {
          const newSet = new Set(prev);
          newSet.delete(readyOrder.fullId);
          return newSet;
        });
        
        // Verificar si la orden sigue en estado "ready" y mostrar notificación de nuevo
        setActiveOrders(prevOrders => {
          const order = prevOrders.find(o => o.fullId === readyOrder.fullId);
          if (order && order.status === 'ready') {
            setReadyOrder(order);
            setIsNotificationOpen(true);
          }
          return prevOrders;
        });
      }, 30000); // 30 segundos
    }
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

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      {/* Header */}
      <WaiterHeader 
        userEmail={user?.email}
        onLogout={handleLogout}
      />
      
      <div className="flex flex-1 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Active Orders Section */}
        <ActiveOrdersTracker
          activeOrders={activeOrders}
          ordersLoading={ordersLoading}
          orderStatus={orderStatus}
          onOrderStatusChange={setOrderStatus}
          onEditOrder={handleEditOrder}
          onViewOrder={handleViewOrder}
        />

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
          
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              {loadingCategories ? (
                <p className="text-gray-500 text-sm">Cargando categorías...</p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No hay productos disponibles</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">No hay productos en esta categoría</p>
            </div>
          ) : (
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
          )}
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

      {/* View Order Dialog */}
      <ViewOrderDialog
        order={viewingOrder}
        open={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      {/* Order Ready Notification */}
      <OrderReadyNotification
        order={readyOrder}
        open={isNotificationOpen}
        onMarkAsDelivered={handleMarkAsDelivered}
        onSnooze={handleSnoozeNotification}
        onClose={() => setIsNotificationOpen(false)}
      />
      </div>
    </div>
    
  );
}
