'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  AlertTriangle,
  Timer,
  Flame,
  RefreshCw,
  Volume2,
  VolumeX,
  UtensilsCrossed,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout';
import { TopAppBar } from '@/components/layout';
import { useSoundNotification } from '@/hooks/use-sound-notification';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types';

// Demo kitchen orders
const demoKitchenOrders: Order[] = [
  {
    id: 'k1',
    restaurantId: 'demo',
    tableId: 't1',
    tableName: 'Table 01',
    items: [
      { itemId: '1', name: 'Signature Latte', quantity: 2, unitPrice: 6.50, notes: 'Extra hot, oat milk' },
      { itemId: '2', name: 'Avocado Toast', quantity: 1, unitPrice: 14.00, notes: 'No tomato' },
    ],
    totalAmount: 27.00,
    state: 'ACCEPTED',
    createdAt: new Date(Date.now() - 3 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'k2',
    restaurantId: 'demo',
    tableId: 't2',
    tableName: 'Table 05',
    items: [
      { itemId: '3', name: 'Truffle Tagliatelle', quantity: 2, unitPrice: 28.00 },
      { itemId: '4', name: 'Burrata Salad', quantity: 1, unitPrice: 14.00, notes: 'Extra basil' },
      { itemId: '5', name: 'Wine Selection', quantity: 1, unitPrice: 48.00 },
    ],
    totalAmount: 118.00,
    state: 'ACCEPTED',
    createdAt: new Date(Date.now() - 8 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'k3',
    restaurantId: 'demo',
    tableId: 't3',
    tableName: 'Table 12',
    items: [
      { itemId: '6', name: 'Classic Flat White', quantity: 3, unitPrice: 5.50 },
      { itemId: '7', name: 'Almond Croissant', quantity: 2, unitPrice: 6.25 },
    ],
    totalAmount: 29.00,
    state: 'ACCEPTED',
    createdAt: new Date(Date.now() - 1 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'k4',
    restaurantId: 'demo',
    tableId: 't4',
    tableName: 'Table 08',
    items: [
      { itemId: '8', name: 'Wagyu Burger', quantity: 1, unitPrice: 32.00, notes: 'Medium rare' },
    ],
    totalAmount: 32.00,
    state: 'ACCEPTED',
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(),
  },
  {
    id: 'k5',
    restaurantId: 'demo',
    tableId: 't5',
    tableName: 'Table 03',
    items: [
      { itemId: '9', name: 'Heirloom Avo Toast', quantity: 2, unitPrice: 14.00 },
      { itemId: '10', name: 'Fresh Juice', quantity: 2, unitPrice: 6.00, notes: 'Orange' },
    ],
    totalAmount: 40.00,
    state: 'ACCEPTED',
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(),
  },
];

interface KitchenOrderCardProps {
  order: Order;
  onComplete: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
  currentTime: Date;
}

function KitchenOrderCard({ order, onComplete, onViewDetails, currentTime }: KitchenOrderCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Calculate time elapsed
  const elapsedMs = currentTime.getTime() - new Date(order.createdAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
  
  // Determine urgency
  const isUrgent = elapsedMinutes >= 10;
  const isWarning = elapsedMinutes >= 5 && elapsedMinutes < 10;
  
  const handleComplete = async () => {
    setIsCompleting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onComplete(order.id);
    setIsCompleting(false);
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-500 hover:shadow-xl ${
        isUrgent 
          ? 'border-error animate-pulse-border' 
          : isWarning 
            ? 'border-amber-400' 
            : 'border-transparent'
      }`}
    >
      {/* Header */}
      <div className={`px-5 py-4 rounded-t-2xl flex items-center justify-between ${
        isUrgent 
          ? 'bg-error/10' 
          : isWarning 
            ? 'bg-amber-50' 
            : 'bg-primary/5'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isUrgent 
              ? 'bg-error text-white' 
              : isWarning 
                ? 'bg-amber-500 text-white' 
                : 'bg-primary text-on-primary'
          }`}>
            <span className="font-display font-bold text-lg">{order.tableName.replace('Table ', 'T-')}</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-primary">{order.tableName}</h3>
            <p className="text-xs text-on-surface-variant">{order.items.length} items • {formatTime(order.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
            isUrgent 
              ? 'bg-error text-white' 
              : isWarning 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            <Timer className="w-4 h-4" />
            {elapsedMinutes}:{elapsedSeconds.toString().padStart(2, '0')}
          </div>
          
          <button 
            onClick={() => onViewDetails(order)}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <Eye className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>
      
      {/* Items List */}
      <div className="p-5 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {order.items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl"
          >
            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isUrgent ? 'bg-error/20 text-error' : 'bg-secondary-fixed/30 text-primary'
            }`}>
              {item.quantity}x
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary truncate">{item.name}</p>
              {item.notes && (
                <p className="text-sm text-amber-600 mt-0.5 italic flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Footer */}
      <div className="px-5 py-4 border-t border-surface-container-high">
        <Button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            isUrgent 
              ? 'bg-error text-white hover:bg-error/90' 
              : 'bg-secondary text-on-secondary hover:opacity-90'
          }`}
        >
          {isCompleting ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Ready
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>(demoKitchenOrders);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { playSound, isMuted, toggleMute } = useSoundNotification({ enabled: true, volume: 0.5 });
  const { toast } = useToast();
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Sort orders by time (oldest first)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const handleCompleteOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
    
    toast({
      title: 'Order Ready!',
      description: `${order?.tableName} order has been marked as ready for serving.`,
    });
    
    playSound('success');
  }, [orders, selectedOrder, toast, playSound]);
  
  // Stats
  const totalOrders = orders.length;
  const urgentOrders = orders.filter(o => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(o.createdAt).getTime()) / 60000);
    return elapsed >= 10;
  }).length;
  const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);
  
  return (
    <DashboardLayout>
      <TopAppBar
        title="Kitchen Display"
        subtitle="Live order queue"
        showSearch={false}
        user={{ name: 'Kitchen Staff', role: 'staff' }}
      />
      
      {/* Sound Toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-40 bg-white p-3 rounded-full shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105"
        title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-on-surface-variant" />
        ) : (
          <Volume2 className="w-5 h-5 text-secondary" />
        )}
      </button>
      
      <div className="p-6 space-y-6">
        {/* Stats Bar */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Active Orders</p>
              <p className="font-display text-3xl text-primary font-bold">{totalOrders}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-14 h-14 bg-error/10 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-error" />
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Urgent</p>
              <p className="font-display text-3xl text-error font-bold">{urgentOrders}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-card flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-medium">Total Items</p>
              <p className="font-display text-3xl text-secondary font-bold">{totalItems}</p>
            </div>
          </div>
        </section>
        
        {/* Orders Grid */}
        {sortedOrders.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onComplete={handleCompleteOrder}
                onViewDetails={setSelectedOrder}
                currentTime={currentTime}
              />
            ))}
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6 animate-bounce-subtle">
              <CheckCircle className="w-12 h-12 text-secondary" />
            </div>
            <h2 className="font-display text-2xl text-primary mb-2">All Caught Up!</h2>
            <p className="text-on-surface-variant max-w-md">
              No pending orders. Take a breather - new orders will appear here automatically.
            </p>
          </div>
        )}
        
        {/* Legend */}
        <section className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 flex items-center gap-6 z-30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-on-surface-variant">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-on-surface-variant">5+ min</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error" />
            <span className="text-sm text-on-surface-variant">10+ min (Urgent)</span>
          </div>
        </section>
      </div>
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-up">
            <div className="p-6 bg-primary text-on-primary">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">{selectedOrder.tableName}</h2>
                  <p className="text-primary-fixed/80 text-sm">
                    {selectedOrder.items.length} items
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-96 custom-scrollbar">
              {selectedOrder.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center font-bold text-primary">
                    {item.quantity}x
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-primary">{item.name}</p>
                    {item.notes && (
                      <p className="text-sm text-amber-600 mt-1 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-surface-container-high">
              <Button
                onClick={() => {
                  handleCompleteOrder(selectedOrder.id);
                }}
                className="w-full bg-secondary text-on-secondary rounded-xl py-3"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Ready
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
