import { useState } from 'react';
import { useAuth } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { KitchenHeader } from '../components/KitchenHeader';
import { KitchenTabs, type TabType } from '../components/KitchenTabs';
import { KitchenOrderCard } from '../components/KitchenOrderCard';
import { useKitchenOrders } from '../hooks/useKitchenOrders';

export function KitchenPage() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/session" replace />;
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const { orders, loading, startCooking, markAsReady, completeOrder } = useKitchenOrders();

  // Calculate counts for each tab
  const tabCounts: Record<TabType, number> = {
    All: orders.length,
    New: orders.filter(o => o.status === 'New Order').length,
    Cooking: orders.filter(o => o.status === 'Cooking').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  // Filter orders based on active tab
  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeTab || (activeTab === 'New' && order.status === 'New Order'));

  const handleStartCooking = (orderId: string) => {
    startCooking(orderId);
  };

  const handleMarkAsReady = (orderId: string) => {
    markAsReady(orderId);
  };

  const handleComplete = (orderId: string) => {
    completeOrder(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenHeader />
      
      <div className="mb-6">
        <h2 className="max-w-[1600px] mx-auto px-6 pt-6 pb-3 text-lg font-semibold text-gray-900">
          Order List
        </h2>
        <KitchenTabs 
          activeTab={activeTab} 
          counts={tabCounts} 
          onTabChange={setActiveTab} 
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-8">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOrders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onStartCooking={handleStartCooking}
                  onMarkAsReady={handleMarkAsReady}
                  onComplete={handleComplete}
                />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No orders found for this filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
