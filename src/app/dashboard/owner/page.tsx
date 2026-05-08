'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffSession } from '@/contexts/StaffSessionContext';
import { DashboardLayout } from '@/components/layout';
import { TopAppBar } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Coffee,
  ShoppingBag,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  UserPlus,
  Building2,
} from 'lucide-react';

// Demo analytics data
const demoAnalytics = {
  overview: {
    todayRevenue: 2847.50,
    yesterdayRevenue: 2423.00,
    todayOrders: 67,
    yesterdayOrders: 58,
    avgOrderValue: 42.50,
    avgOrderValueYesterday: 41.78,
    activeCustomers: 23,
    peakHour: '14:00',
    completionRate: 94.2,
  },
  revenueByHour: [
    { hour: '08:00', revenue: 120 },
    { hour: '09:00', revenue: 280 },
    { hour: '10:00', revenue: 420 },
    { hour: '11:00', revenue: 580 },
    { hour: '12:00', revenue: 890 },
    { hour: '13:00', revenue: 1250 },
    { hour: '14:00', revenue: 980 },
    { hour: '15:00', revenue: 650 },
    { hour: '16:00', revenue: 420 },
    { hour: '17:00', revenue: 380 },
    { hour: '18:00', revenue: 520 },
    { hour: '19:00', revenue: 680 },
  ],
  topItems: [
    { name: 'Signature Latte', sales: 47, revenue: 258.50, trend: 'up' },
    { name: 'Avocado Toast', sales: 32, revenue: 384.00, trend: 'up' },
    { name: 'Truffle Tagliatelle', sales: 28, revenue: 784.00, trend: 'up' },
    { name: 'Cappuccino', sales: 25, revenue: 112.50, trend: 'down' },
    { name: 'Fresh Juice', sales: 22, revenue: 132.00, trend: 'same' },
  ],
  staffPerformance: [
    { name: 'Sarah Chen', role: 'waiter', ordersServed: 23, avgTime: '4.2m', rating: 4.8 },
    { name: 'Mike Johnson', role: 'waiter', ordersServed: 19, avgTime: '3.8m', rating: 4.9 },
    { name: 'Emma Davis', role: 'kitchen', ordersPrepared: 42, avgTime: '8.5m', rating: 4.7 },
    { name: 'Tom Wilson', role: 'cashier', transactions: 31, avgTime: '1.2m', rating: 4.6 },
  ],
  recentAlerts: [
    { type: 'warning', message: 'Table T-05 has been waiting 15+ minutes', time: '2m ago' },
    { type: 'success', message: 'Daily revenue target achieved', time: '15m ago' },
    { type: 'info', message: 'New menu item "Seasonal Special" is trending', time: '1h ago' },
    { type: 'error', message: 'Inventory alert: Coffee beans low', time: '2h ago' },
  ],
  weeklyComparison: [
    { day: 'Mon', thisWeek: 1850, lastWeek: 1650 },
    { day: 'Tue', thisWeek: 2100, lastWeek: 1920 },
    { day: 'Wed', thisWeek: 2340, lastWeek: 2100 },
    { day: 'Thu', thisWeek: 2580, lastWeek: 2340 },
    { day: 'Fri', thisWeek: 3200, lastWeek: 2980 },
    { day: 'Sat', thisWeek: 3800, lastWeek: 3520 },
    { day: 'Sun', thisWeek: 2847, lastWeek: 2650 },
  ],
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { session, isStaffAuthenticated, isLoading: sessionLoading } = useStaffSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !isStaffAuthenticated) {
      router.push('/staff/login');
      return;
    }
    
    // Check if user has owner role
    if (session && session.role !== 'owner' && session.role !== 'admin') {
      router.push('/staff/dashboard');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [sessionLoading, isStaffAuthenticated, session, router]);

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A322D]" />
      </div>
    );
  }

  const { overview, topItems, staffPerformance, recentAlerts, weeklyComparison, revenueByHour } = demoAnalytics;

  const percentChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = percentChange(overview.todayRevenue, overview.yesterdayRevenue);
  const ordersChange = percentChange(overview.todayOrders, overview.yesterdayOrders);

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...revenueByHour.map(h => h.revenue));

  return (
    <DashboardLayout>
      <TopAppBar
        title="Owner Dashboard"
        subtitle={`${session?.restaurantName || 'Restaurant'}`}
        showSearch={false}
        user={{
          name: session?.staffName || 'Owner',
          role: session?.role || 'owner',
        }}
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#3A322D]">Analytics Overview</h1>
            <p className="text-[#5A4A3D] mt-1">Real-time insights for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm bg-[#C9A07E]/10 border-[#C9A07E]/30 text-[#3A322D]">
              <Activity className="w-4 h-4 mr-2" />
              Live
            </Badge>
            <Button variant="outline" className="rounded-full" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#3A322D] to-[#5A4A3D] text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Today&apos;s Revenue</p>
                  <p className="text-3xl font-bold mt-2">${overview.todayRevenue.toFixed(2)}</p>
                  <div className={`flex items-center mt-2 text-sm ${revenueChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(revenueChange).toFixed(1)}% vs yesterday
                  </div>
                </div>
                <DollarSign className="w-10 h-10 text-white/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#EFE4D8] shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5A4A3D] text-sm font-medium uppercase tracking-wider">Orders Today</p>
                  <p className="text-3xl font-bold text-[#3A322D] mt-2">{overview.todayOrders}</p>
                  <div className={`flex items-center mt-2 text-sm ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ordersChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(ordersChange).toFixed(1)}% vs yesterday
                  </div>
                </div>
                <ShoppingBag className="w-10 h-10 text-[#C9A07E]/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#EFE4D8] shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5A4A3D] text-sm font-medium uppercase tracking-wider">Avg Order Value</p>
                  <p className="text-3xl font-bold text-[#3A322D] mt-2">${overview.avgOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-[#5A4A3D] mt-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Peak: {overview.peakHour}
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-[#C9A07E]/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#EFE4D8] shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#5A4A3D] text-sm font-medium uppercase tracking-wider">Completion Rate</p>
                  <p className="text-3xl font-bold text-[#3A322D] mt-2">{overview.completionRate}%</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Excellent
                  </p>
                </div>
                <Activity className="w-10 h-10 text-[#C9A07E]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-[#EFE4D8] p-1 rounded-full">
            <TabsTrigger value="overview" className="rounded-full px-6">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="rounded-full px-6">Revenue</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-full px-6">Staff</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-full px-6">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 bg-white border border-[#EFE4D8]">
                <CardHeader>
                  <CardTitle className="text-[#3A322D] font-serif">Hourly Revenue</CardTitle>
                  <CardDescription>Today&apos;s revenue distribution by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-1">
                    {revenueByHour.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div 
                          className="w-full bg-gradient-to-t from-[#3A322D] to-[#C9A07E] rounded-t-sm transition-all group-hover:from-[#C9A07E] group-hover:to-[#C9A07E] cursor-pointer"
                          style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                          title={`${item.hour}: $${item.revenue}`}
                        />
                        <span className="text-xs text-[#5A4A3D] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.hour.split(':')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Items */}
              <Card className="bg-white border border-[#EFE4D8]">
                <CardHeader>
                  <CardTitle className="text-[#3A322D] font-serif">Top Sellers</CardTitle>
                  <CardDescription>Best performing items today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFBF9] hover:bg-[#EFE4D8]/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#C9A07E]/20 flex items-center justify-center text-[#3A322D] font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#3A322D]">{item.name}</p>
                        <p className="text-sm text-[#5A4A3D]">{item.sales} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#3A322D]">${item.revenue.toFixed(2)}</p>
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />}
                        {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 ml-auto" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Weekly Comparison */}
            <Card className="bg-white border border-[#EFE4D8]">
              <CardHeader>
                <CardTitle className="text-[#3A322D] font-serif">Weekly Comparison</CardTitle>
                <CardDescription>This week vs last week revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-4">
                  {weeklyComparison.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 h-36 items-end">
                        <div 
                          className="flex-1 bg-[#3A322D] rounded-t-sm"
                          style={{ height: `${(day.thisWeek / 4000) * 100}%` }}
                        />
                        <div 
                          className="flex-1 bg-[#C9A07E]/40 rounded-t-sm"
                          style={{ height: `${(day.lastWeek / 4000) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#5A4A3D] font-medium">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[#EFE4D8]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#3A322D]" />
                    <span className="text-sm text-[#5A4A3D]">This Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-[#C9A07E]/40" />
                    <span className="text-sm text-[#5A4A3D]">Last Week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-[#EFE4D8]">
                <CardHeader>
                  <CardTitle className="text-[#3A322D] font-serif">Revenue Breakdown</CardTitle>
                  <CardDescription>Sales by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Coffee & Beverages', amount: 1245.50, percent: 43.7 },
                      { category: 'Main Courses', amount: 890.00, percent: 31.3 },
                      { category: 'Desserts', amount: 456.00, percent: 16.0 },
                      { category: 'Appetizers', amount: 256.00, percent: 9.0 },
                    ].map((cat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#3A322D] font-medium">{cat.category}</span>
                          <span className="text-[#5A4A3D]">${cat.amount.toFixed(2)} ({cat.percent}%)</span>
                        </div>
                        <div className="h-2 bg-[#EFE4D8] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#3A322D] to-[#C9A07E] rounded-full"
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-[#EFE4D8]">
                <CardHeader>
                  <CardTitle className="text-[#3A322D] font-serif">Payment Methods</CardTitle>
                  <CardDescription>Transaction breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { method: 'Credit Card', amount: 1520.00, count: 28, icon: '💳' },
                      { method: 'Cash', amount: 890.50, count: 22, icon: '💵' },
                      { method: 'Mobile Payment', amount: 437.00, count: 17, icon: '📱' },
                    ].map((pm, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#FCFBF9]">
                        <span className="text-2xl">{pm.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-[#3A322D]">{pm.method}</p>
                          <p className="text-sm text-[#5A4A3D]">{pm.count} transactions</p>
                        </div>
                        <p className="font-semibold text-[#3A322D]">${pm.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3A322D]">Staff Performance</h2>
                <p className="text-[#5A4A3D]">Today&apos;s team metrics</p>
              </div>
              <Button className="bg-[#3A322D] hover:bg-[#5A4A3D] text-white rounded-full" onClick={() => router.push('/dashboard/staff')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Manage Staff
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {staffPerformance.map((staff, i) => (
                <Card key={i} className="bg-white border border-[#EFE4D8] hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3A322D] to-[#C9A07E] flex items-center justify-center text-white font-bold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-[#3A322D]">{staff.name}</p>
                        <Badge variant="outline" className="capitalize text-xs">{staff.role}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[#3A322D]">{staff.ordersServed || staff.ordersPrepared || staff.transactions}</p>
                        <p className="text-xs text-[#5A4A3D]">Orders</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#3A322D]">{staff.avgTime}</p>
                        <p className="text-xs text-[#5A4A3D]">Avg Time</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-1 text-[#C9A07E]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{staff.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-white border border-[#EFE4D8]">
              <CardHeader>
                <CardTitle className="text-[#3A322D] font-serif">Recent Alerts</CardTitle>
                <CardDescription>System notifications and important updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-3 p-4 rounded-xl ${
                        alert.type === 'error' ? 'bg-red-50 border border-red-100' :
                        alert.type === 'warning' ? 'bg-amber-50 border border-amber-100' :
                        alert.type === 'success' ? 'bg-green-50 border border-green-100' :
                        'bg-blue-50 border border-blue-100'
                      }`}
                    >
                      {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                      {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />}
                      {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                      {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-500 mt-0.5" />}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          alert.type === 'error' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-amber-800' :
                          alert.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-sm text-[#5A4A3D] mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
