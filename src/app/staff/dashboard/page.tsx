'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffSession } from '@/contexts/StaffSessionContext';
import { TableGrid } from '@/components/cashier/TableGrid';
import { OrderPanel } from '@/components/cashier/OrderPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  LogOut,
  User,
  Settings,
  Bell,
  RefreshCw,
  AlertTriangle,
  Coffee,
  CheckCircle
} from 'lucide-react';
import type { Order, Table } from '@/types';
import { cashierService } from '@/services/cashierService';
import { logService } from '@/services/logService';

// Demo data for development without Firebase
const DEMO_TABLES: Table[] = [
  { id: 't1', restaurantId: 'demo-restaurant-zcoffee', name: 'T-01', seats: 4, status: 'EMPTY', qrCodeUrl: '/r/zcoffee/t/T-01', activeOrderId: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 't2', restaurantId: 'demo-restaurant-zcoffee', name: 'T-02', seats: 2, status: 'NEW_ORDER', qrCodeUrl: '/r/zcoffee/t/T-02', activeOrderId: 'o1', createdAt: new Date(), updatedAt: new Date() },
  { id: 't3', restaurantId: 'demo-restaurant-zcoffee', name: 'T-03', seats: 6, status: 'ACTIVE', qrCodeUrl: '/r/zcoffee/t/T-03', activeOrderId: 'o2', createdAt: new Date(), updatedAt: new Date() },
  { id: 't4', restaurantId: 'demo-restaurant-zcoffee', name: 'T-04', seats: 4, status: 'AWAITING_PAYMENT', qrCodeUrl: '/r/zcoffee/t/T-04', activeOrderId: 'o3', createdAt: new Date(), updatedAt: new Date() },
  { id: 't5', restaurantId: 'demo-restaurant-zcoffee', name: 'T-05', seats: 2, status: 'EMPTY', qrCodeUrl: '/r/zcoffee/t/T-05', activeOrderId: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 't6', restaurantId: 'demo-restaurant-zcoffee', name: 'T-06', seats: 8, status: 'EMPTY', qrCodeUrl: '/r/zcoffee/t/T-06', activeOrderId: null, createdAt: new Date(), updatedAt: new Date() },
];

const DEMO_ORDERS: Order[] = [
  {
    id: 'o1',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 't2',
    tableName: 'T-02',
    items: [
      { itemId: 'm1', name: 'Espresso', quantity: 2, price: 3.5, unitPrice: 3.5 },
      { itemId: 'm2', name: 'Cappuccino', quantity: 1, price: 4.5, unitPrice: 4.5, notes: 'Extra foam' },
    ],
    subtotal: 11.5,
    totalAmount: 11.5,
    status: 'CREATED',
    createdAt: new Date(Date.now() - 180000), // 3 min ago
    updatedAt: new Date(),
  },
  {
    id: 'o2',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 't3',
    tableName: 'T-03',
    items: [
      { itemId: 'm3', name: 'Latte', quantity: 3, price: 5.0, unitPrice: 5.0 },
      { itemId: 'm4', name: 'Croissant', quantity: 2, price: 3.0, unitPrice: 3.0 },
    ],
    subtotal: 21.0,
    totalAmount: 21.0,
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 600000), // 10 min ago
    updatedAt: new Date(),
    acceptedAt: new Date(Date.now() - 540000),
  },
  {
    id: 'o3',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 't4',
    tableName: 'T-04',
    items: [
      { itemId: 'm5', name: 'Iced Coffee', quantity: 2, price: 4.0, unitPrice: 4.0 },
      { itemId: 'm6', name: 'Cheesecake', quantity: 1, price: 6.5, unitPrice: 6.5 },
    ],
    subtotal: 14.5,
    totalAmount: 14.5,
    status: 'PAID',
    createdAt: new Date(Date.now() - 1200000), // 20 min ago
    updatedAt: new Date(),
    acceptedAt: new Date(Date.now() - 1140000),
    paidAt: new Date(Date.now() - 300000),
  },
];

export default function StaffDashboardPage() {
  const router = useRouter();
  const { session, isStaffAuthenticated, isLoading: sessionLoading, logoutStaff } = useStaffSession();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reasonAction, setReasonAction] = useState<{ action: string; table: Table } | null>(null);
  const [reason, setReason] = useState('');
  const [useDemo, setUseDemo] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionLoading && !isStaffAuthenticated) {
      router.push('/staff/login');
    }
  }, [sessionLoading, isStaffAuthenticated, router]);

  // Load data
  useEffect(() => {
    if (!session) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to load from Firebase
        const [tablesData, ordersData] = await Promise.all([
          cashierService.getTables(session.restaurantId),
          cashierService.getActiveOrders(session.restaurantId),
        ]);
        
        if (tablesData.length > 0) {
          setTables(tablesData);
          setOrders(ordersData);
          setUseDemo(false);
        } else {
          // Use demo data if no Firebase data
          setTables(DEMO_TABLES);
          setOrders(DEMO_ORDERS);
          setUseDemo(true);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Use demo data on error
        setTables(DEMO_TABLES);
        setOrders(DEMO_ORDERS);
        setUseDemo(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [session]);

  // Handle table action
  const handleAction = useCallback(async (action: 'accept' | 'reject' | 'paid' | 'close' | 'cancel', table: Table) => {
    if (!session || !table.activeOrderId) return;
    
    const order = orders.find(o => o.id === table.activeOrderId);
    if (!order) return;
    
    // Actions requiring reason
    if (action === 'reject' || action === 'cancel') {
      setReasonAction({ action, table });
      setShowReasonDialog(true);
      return;
    }
    
    setActionLoading(table.id);
    
    try {
      const params = {
        restaurantId: session.restaurantId,
        orderId: table.activeOrderId,
        tableId: table.id,
        actorId: session.staffId,
        actorName: session.staffName,
        actorRole: session.role,
      };
      
      let result;
      
      switch (action) {
        case 'accept':
          result = await cashierService.acceptOrder(params);
          break;
        case 'paid':
          result = await cashierService.markOrderPaid(params);
          break;
        case 'close':
          result = await cashierService.closeOrder(params);
          break;
      }
      
      if (result?.success) {
        // Update local state
        setTables(prev => prev.map(t => {
          if (t.id === table.id) {
            const newStatus = action === 'accept' ? 'ACTIVE' : 
                             action === 'paid' ? 'AWAITING_PAYMENT' : 'EMPTY';
            return {
              ...t,
              status: newStatus,
              activeOrderId: action === 'close' ? null : t.activeOrderId,
            };
          }
          return t;
        }));
        
        setOrders(prev => prev.map(o => {
          if (o.id === table.activeOrderId) {
            const newStatus = action === 'accept' ? 'ACCEPTED' : 
                             action === 'paid' ? 'PAID' : 'CLOSED';
            return {
              ...o,
              status: newStatus,
              ...(action === 'accept' && { acceptedAt: new Date() }),
              ...(action === 'paid' && { paidAt: new Date() }),
              ...(action === 'close' && { closedAt: new Date() }),
            };
          }
          return o;
        }));
      }
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
    } finally {
      setActionLoading(null);
    }
  }, [session, orders]);

  // Handle reason dialog submit
  const handleReasonSubmit = useCallback(async () => {
    if (!reasonAction || !reason.trim() || !session) return;
    
    const { action, table } = reasonAction;
    if (!table.activeOrderId) return;
    
    setActionLoading(table.id);
    setShowReasonDialog(false);
    
    try {
      const params = {
        restaurantId: session.restaurantId,
        orderId: table.activeOrderId,
        tableId: table.id,
        reason: reason.trim(),
        actorId: session.staffId,
        actorName: session.staffName,
        actorRole: session.role,
      };
      
      let result;
      
      if (action === 'reject') {
        result = await cashierService.rejectOrder(params);
      } else if (action === 'cancel') {
        result = await cashierService.cancelOrder(params);
      }
      
      if (result?.success) {
        // Update local state
        setTables(prev => prev.map(t => {
          if (t.id === table.id) {
            return {
              ...t,
              status: 'EMPTY',
              activeOrderId: null,
            };
          }
          return t;
        }));
        
        setOrders(prev => prev.filter(o => o.id !== table.activeOrderId));
      }
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
    } finally {
      setActionLoading(null);
      setReasonAction(null);
      setReason('');
    }
  }, [reasonAction, reason, session]);

  // Handle logout
  const handleLogout = () => {
    logoutStaff();
    router.push('/staff/login');
  };

  if (sessionLoading || !isStaffAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A322D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#EFE4D8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Restaurant */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#3A322D] to-[#5A4A3D] flex items-center justify-center">
                <Coffee className="h-5 w-5 text-[#C9A07E]" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-[#3A322D]">{session?.restaurantName || 'MenuxPro'}</h1>
                <p className="text-xs text-[#5A4A3D]">Cashier Dashboard</p>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-3">
              {useDemo && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  Demo Mode
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="text-[#5A4A3D] hover:text-[#3A322D]"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#3A322D] flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:inline text-[#3A322D]">{session?.staffName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{session?.staffName}</p>
                      <p className="text-xs text-gray-500 capitalize">{session?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3A322D]" />
          </div>
        ) : (
          <TableGrid
            tables={tables}
            orders={orders}
            onAction={handleAction}
            isLoading={actionLoading !== null}
            loadingTableId={actionLoading}
          />
        )}
      </main>

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {reasonAction?.action === 'reject' ? 'Reject Order' : 'Cancel Order'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for this action. This is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReasonDialog(false);
              setReasonAction(null);
              setReason('');
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReasonSubmit}
              disabled={!reason.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
