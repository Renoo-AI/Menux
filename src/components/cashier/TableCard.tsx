'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  AlertCircle,
  Coffee,
  MinusCircle
} from 'lucide-react';
import type { Table, TableStatus, Order } from '@/types';

interface TableCardProps {
  table: Table;
  activeOrder?: Order | null;
  orderAge?: number; // seconds since order created
  onAction?: (action: 'accept' | 'reject' | 'paid' | 'close' | 'cancel', table: Table) => void;
  isLoading?: boolean;
}

const statusConfig: Record<TableStatus, { 
  color: string; 
  bgColor: string; 
  borderColor: string;
  icon: typeof Clock;
  label: string;
}> = {
  EMPTY: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: MinusCircle,
    label: 'Available',
  },
  NEW_ORDER: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: AlertCircle,
    label: 'New Order',
  },
  ACTIVE: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: Coffee,
    label: 'Active',
  },
  AWAITING_PAYMENT: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: DollarSign,
    label: 'Payment',
  },
  OFFLINE: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: XCircle,
    label: 'Offline',
  },
};

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function TableCard({ table, activeOrder, orderAge, onAction, isLoading }: TableCardProps) {
  const config = statusConfig[table.status];
  const Icon = config.icon;
  
  const isUrgent = orderAge && orderAge > 300; // 5+ minutes
  const isVeryUrgent = orderAge && orderAge > 600; // 10+ minutes
  
  return (
    <Card className={`
      relative overflow-hidden transition-all duration-200 hover:shadow-lg
      ${config.borderColor} ${config.bgColor}
      ${isUrgent ? 'ring-2 ring-amber-400' : ''}
      ${isVeryUrgent ? 'ring-2 ring-red-400 animate-pulse' : ''}
    `}>
      {/* Status indicator bar */}
      <div className={`h-1 w-full ${config.borderColor.replace('border-', 'bg-')}`} />
      
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`
              h-10 w-10 rounded-lg flex items-center justify-center
              ${config.borderColor.replace('border-', 'bg-')} ${config.color}
            `}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#3A322D]">{table.name}</h3>
              <p className="text-xs text-[#5A4A3D]">{table.seats} seats</p>
            </div>
          </div>
          <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor}`}>
            {config.label}
          </Badge>
        </div>
        
        {/* Order info */}
        {activeOrder && (
          <div className="mb-3 p-2 rounded-lg bg-white/50 border border-white/80">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5A4A3D]">Items:</span>
              <span className="font-medium text-[#3A322D]">
                {activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5A4A3D]">Total:</span>
              <span className="font-bold text-[#3A322D]">
                {activeOrder.totalAmount.toFixed(2)} TND
              </span>
            </div>
            {orderAge !== undefined && (
              <div className={`
                flex items-center justify-between text-sm mt-1 pt-1 border-t border-gray-200
                ${isUrgent ? 'text-amber-600' : isVeryUrgent ? 'text-red-600' : 'text-[#5A4A3D]'}
              `}>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Age:
                </span>
                <span className="font-medium">{formatAge(orderAge)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        {table.status === 'NEW_ORDER' && activeOrder && onAction && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onAction('accept', table)}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => onAction('reject', table)}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
        
        {table.status === 'ACTIVE' && activeOrder && onAction && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onAction('paid', table)}
              disabled={isLoading}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Paid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => onAction('cancel', table)}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
        
        {table.status === 'AWAITING_PAYMENT' && activeOrder && onAction && (
          <Button
            size="sm"
            className="w-full bg-[#3A322D] hover:bg-[#5A4A3D] text-white"
            onClick={() => onAction('close', table)}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Close Table
          </Button>
        )}
        
        {table.status === 'EMPTY' && (
          <div className="text-center text-sm text-[#5A4A3D] py-2">
            Ready for new orders
          </div>
        )}
        
        {table.status === 'OFFLINE' && (
          <div className="text-center text-sm text-gray-400 py-2">
            Table is offline
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TableCard;
