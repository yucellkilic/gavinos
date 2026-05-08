'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Users,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Mock data for initial empty state
const mockRevenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 2400 },
  { name: 'Fri', total: 3200 },
  { name: 'Sat', total: 4500 },
  { name: 'Sun', total: 3800 },
];

const mockOrdersData = [
  { name: 'Pizza', count: 45 },
  { name: 'Pasta', count: 32 },
  { name: 'Salad', count: 28 },
  { name: 'Beverages', count: 65 },
  { name: 'Desserts', count: 20 },
];

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeUsers: 0,
    profit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // In a real app, we'd aggregate from the orders table
      const { data: orders, error } = await supabase.from('orders').select('*');
      
      if (!error && orders && orders.length > 0) {
        const total = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        setStats({
          totalSales: total,
          totalOrders: orders.length,
          activeUsers: new Set(orders.map(o => o.user_id)).size,
          profit: total * 0.35 // Assuming 35% margin for demo
        });
      } else {
        // Fallback to mock stats if no real data yet
        setStats({
          totalSales: 24500.50,
          totalOrders: 342,
          activeUsers: 128,
          profit: 8575.17
        });
      }
      setLoading(false);
    }
    
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalSales.toLocaleString('en-US', {minimumFractionDigits: 2})}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Net Profit', value: `$${stats.profit.toLocaleString('en-US', {minimumFractionDigits: 2})}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Active Customers', value: stats.activeUsers.toString(), icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-800/50 rounded-3xl"></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back. Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50 relative overflow-hidden group"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-gray-400 font-medium text-sm mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-forestGreen" /> Revenue Overview
            </h3>
            <select className="bg-gray-900 border border-gray-700 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-forestGreen">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-3xl border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <ShoppingBag className="text-blue-400" /> Top Categories
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockOrdersData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#374151', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
