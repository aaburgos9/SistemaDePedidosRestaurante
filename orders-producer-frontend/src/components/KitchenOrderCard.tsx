import { formatCOP } from '../utils/currency';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, MapPin, Flame, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderStatus = 'New Order' | 'Cooking' | 'Ready' | 'Completed' | 'Cancelled';

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  time: string;
  table: string;
  products: Product[];
  total: number;
  status: OrderStatus;
}

interface KitchenOrderCardProps {
  order: Order;
  onStartCooking?: (orderId: string) => void;
  onMarkAsReady?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
}

const statusConfig = {
  'New Order': { color: 'text-purple-600', bg: 'bg-purple-50', variant: 'secondary' as const },
  'Cooking': { color: 'text-orange-500', bg: 'bg-orange-50', variant: 'secondary' as const },
  'Ready': { color: 'text-blue-600', bg: 'bg-blue-50', variant: 'default' as const },
  'Completed': { color: 'text-green-600', bg: 'bg-green-50', variant: 'secondary' as const },
  'Cancelled': { color: 'text-gray-500', bg: 'bg-gray-50', variant: 'outline' as const },
};

export function KitchenOrderCard({ order, onStartCooking, onMarkAsReady, onComplete }: KitchenOrderCardProps) {
  const config = statusConfig[order.status];
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
          </div>
          <span className="text-sm font-medium text-gray-600">{order.id}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{order.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="size-4" />
            <span>{order.table}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Order ({order.products.length})</h4>
          <span className="text-lg font-bold text-gray-900">{formatCOP(order.total)}</span>
        </div>

        <div className="space-y-2">
          {order.products.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {product.quantity}x {product.name}
              </span>
              <span className="font-medium text-gray-900">{formatCOP(product.price)}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <div className="px-6 pb-6">
        <Badge 
          variant={config.variant}
          className={cn("w-full justify-center mb-3 py-2", config.bg, config.color)}
        >
          {order.status}
        </Badge>

        {/* TODO: Connect these buttons to backend WebSocket/API */}
        {order.status === 'New Order' && (
          <Button
            onClick={() => onStartCooking?.(order.id)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Flame className="size-4" />
            Start Cooking
          </Button>
        )}

        {order.status === 'Cooking' && (
          <Button
            onClick={() => onMarkAsReady?.(order.id)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <AlertTriangle className="size-4" />
            Mark as Ready
          </Button>
        )}

        {order.status === 'Ready' && (
          <Button
            onClick={() => onComplete?.(order.id)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Check className="size-4" />
            Complete Order
          </Button>
        )}

        {order.status === 'Completed' && (
          <div className="w-full bg-green-50 text-green-600 font-medium py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2">
            <Check className="size-4" />
            Order Completed
          </div>
        )}
      </div>
    </Card>
  );
}
