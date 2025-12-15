import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Pencil, Eye } from 'lucide-react';
import type { ActiveOrder } from '../hooks/useActiveOrders';

type OrderStatusFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'completed';

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

interface ActiveOrdersTrackerProps {
  activeOrders: ActiveOrder[];
  ordersLoading: boolean;
  orderStatus: OrderStatusFilter;
  onOrderStatusChange: (status: OrderStatusFilter) => void;
  onEditOrder: (order: ActiveOrder) => void;
  onViewOrder: (order: ActiveOrder) => void;
}

export function ActiveOrdersTracker({
  activeOrders,
  ordersLoading,
  orderStatus,
  onOrderStatusChange,
  onEditOrder,
  onViewOrder,
}: ActiveOrdersTrackerProps) {
  return (
    <div className="bg-white border-b px-6 py-3 pt-9">
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Track Order</h2>
        </div>
        
        <div className="flex gap-2">
          {ORDER_STATUS_FILTERS.map(({ value, label }) => (
            <Button
              key={value}
              variant={orderStatus === value ? 'default' : 'outline'}
              onClick={() => onOrderStatusChange(value)}
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
                    {isEditable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditOrder(order)}
                        className="h-7 w-7 p-0 cursor-pointer"
                        title="Edit order"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        className="h-7 w-7 p-0 cursor-pointer"
                        title="View order details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
