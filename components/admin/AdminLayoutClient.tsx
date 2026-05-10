'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Lock,
  Mail,
  Activity,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forestGreen"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/50 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="bg-forestGreen/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-forestGreen/30">
              <Lock className="text-forestGreen" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Admin Portal</h1>
            <p className="text-gray-400 text-sm mt-2">Gavino's Pizza Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                  required
                />
              </div>
            </div>
            {authError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-classicRed text-sm text-center">
                {authError}
              </motion.p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forestGreen hover:bg-forestGreen/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-forestGreen/20 active:scale-[0.98]"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: UtensilsCrossed, label: 'Products', href: '/admin/products' },
    { icon: Sparkles, label: 'Modifiers', href: '/admin/modifiers' },
    { icon: DollarSign, label: 'Bulk Pricing', href: '/admin/bulk-pricing' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter selection:bg-forestGreen/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-forestGreen text-white p-1.5 rounded-lg">
            <Activity size={20} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">Gavino's Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-300 p-1">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 z-40 flex flex-col pt-20 lg:pt-0"
          >
            <div className="hidden lg:flex items-center gap-3 p-8 border-b border-gray-800/50">
              <div className="bg-gradient-to-br from-forestGreen to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-forestGreen/20">
                <Activity size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-wide text-white">Gavino's</span>
                <span className="text-xs font-medium text-forestGreen uppercase tracking-widest">Workspace</span>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Menu</div>
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.label} onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                      isActive 
                        ? 'bg-forestGreen/10 text-forestGreen border border-forestGreen/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                    }`}>
                      <item.icon size={20} className={isActive ? 'text-forestGreen' : 'text-gray-400 group-hover:text-white transition-colors'} />
                      <span className={`font-semibold ${isActive ? 'text-forestGreen' : 'text-gray-300 group-hover:text-white'}`}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-classicRed/10 hover:bg-classicRed/20 text-classicRed font-bold rounded-xl transition-colors border border-classicRed/20"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-20 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
