import { formatCOP } from '../utils/currency';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Product } from '../types/order';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <Badge className="absolute top-3 left-3 bg-white text-gray-800">
          Main Course
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-xl font-bold text-gray-900">
            {formatCOP(product.price)}
          </p>
          
          <Button
            onClick={() => onAdd(product)}
            size="icon"
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}