import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface KitchenHeaderProps {
  currentDate?: string;
}

export function KitchenHeader({ currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
}) }: KitchenHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hi, here are today's orders!</h1>
            <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
          </div>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
