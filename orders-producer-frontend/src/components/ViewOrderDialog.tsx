import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { ActiveOrder } from '../hooks/useActiveOrders';

interface ViewOrderDialogProps {
  order: ActiveOrder | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_CONFIG = {
  ready: { color: 'bg-green-500', text: 'Ready' },
  preparing: { color: 'bg-blue-500', text: 'Preparing' },
  pending: { color: 'bg-orange-500', text: 'Pending' },
  completed: { color: 'bg-gray-500', text: 'Completed' },
} as const;

export function ViewOrderDialog({ order, open, onClose }: ViewOrderDialogProps) {
  if (!order) return null;

  const { color, text } = STATUS_CONFIG[order.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Order ID</label>
              <p className="mt-1 text-sm text-gray-900">{order.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <Badge className={`${color} text-white`}>
                  {text}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name</label>
              <p className="mt-1 text-sm text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Table</label>
              <p className="mt-1 text-sm text-gray-900">{order.table}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Time Elapsed</label>
              <p className="mt-1 text-sm text-gray-900">{order.timeRemaining}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Items</label>
              <p className="mt-1 text-sm text-gray-900">{order.itemCount}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Note:</span> {item.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Qty: <span className="font-medium">{item.quantity}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                ${order.items
                  .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}