import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export type TabType = 'All' | 'New' | 'Cooking' | 'Ready' | 'Completed' | 'Cancelled';

interface KitchenTabsProps {
  activeTab: TabType;
  counts: Record<TabType, number>;
  onTabChange: (tab: TabType) => void;
}

const tabs: TabType[] = ['All', 'New', 'Cooking', 'Ready', 'Completed', 'Cancelled'];

export function KitchenTabs({ activeTab, counts, onTabChange }: KitchenTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "relative px-6 py-4 font-medium text-sm transition-colors",
                activeTab === tab 
                  ? "text-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{tab}</span>
                <Badge 
                  variant={activeTab === tab ? "default" : "outline"}
                  className={cn(
                    activeTab === tab && "bg-blue-600 hover:bg-blue-600"
                  )}
                >
                  {counts[tab]}
                </Badge>
              </div>
              
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
