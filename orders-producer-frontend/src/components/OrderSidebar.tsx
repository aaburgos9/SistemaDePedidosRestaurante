import { useState } from 'react';
import { formatCOP } from '../utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Minus, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types/order';

interface OrderSidebarProps {
  order: Order;
  total: number;
  onChangeQty: (productId: number, delta: number) => void;
  onAddNote: (productId: number, note: string) => void;
  onSend: (table: string, clientName: string) => Promise<void>;
  successMsg: string | null;
}

export default function OrderSidebar({
  order,
  total,
  onChangeQty,
  onAddNote,
  onSend,
  successMsg
}: OrderSidebarProps) {
  const [customerName, setCustomerName] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

  const handleSubmit = async () => {
    if (!selectedTable && orderType === 'dine-in') return;
    await onSend(selectedTable || 'Takeaway', customerName);
    setCustomerName('');
    setSelectedTable('');
  };

  const subtotal = total;
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + tax;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <h2 className="text-xl font-semibold text-gray-800">Current Order</h2>
      </div>

      {/* Order Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Customer Info */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="customer-name" className="text-sm font-medium text-gray-700">
              Customer name
            </Label>
            <Input
              id="customer-name"
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Order Type
            </Label>
            <div className="flex gap-2">
              <Button
                variant={orderType === 'dine-in' ? 'default' : 'outline'}
                onClick={() => setOrderType('dine-in')}
                className="flex-1 rounded-full"
              >
                Dine-in
              </Button>
              <Button
                variant={orderType === 'takeaway' ? 'default' : 'outline'}
                onClick={() => setOrderType('takeaway')}
                className="flex-1 rounded-full"
              >
                Takeaway
              </Button>
            </div>
          </div>

          {orderType === 'dine-in' && (
            <div>
              <Label htmlFor="table-select" className="text-sm font-medium text-gray-700">
                Select table
              </Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger id="table-select" className="mt-1">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={`Table ${num}`}>
                      Table {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Order Items */}
        {order.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No items added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {order.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCOP(item.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onChangeQty(item.id, -item.qty)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onChangeQty(item.id, -1)}
                      className="h-8 w-8"
                      disabled={item.qty <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onChangeQty(item.id, 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Add note..."
                    value={item.note || ''}
                    onChange={(e) => onAddNote(item.id, e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Totals */}
      <div className="bg-white border-t p-6 space-y-4">
        {successMsg && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMsg}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (10%)</span>
            <span>{formatCOP(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{formatCOP(totalAmount)}</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={order.items.length === 0 || (orderType === 'dine-in' && !selectedTable)}
          className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-base"
        >
          <Send className="w-5 h-5 mr-2" />
          Send to Kitchen
        </Button>
      </div>
    </div>
  );
}