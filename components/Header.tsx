'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, ChevronDown, Package, Lock } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const { profile, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemCount = isMounted ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const navLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" suppressHydrationWarning>
      <nav className="ez-container">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-2 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--ez-green)] rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">G</div>
              <div className="flex flex-col leading-none truncate">
                <span className="text-sm sm:text-xl font-black text-[var(--ez-gray-900)] tracking-tighter truncate">
                  <span>GAVINO'S</span>
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-[var(--ez-green)] tracking-[0.2em]">CATERING</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav & Group Order */}
          {!isAdminPath && (
            <div className="hidden lg:flex items-center gap-6 flex-1 ml-10">
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-[14px] font-bold text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] transition-colors"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="h-6 w-px bg-gray-200 mx-2" />
              
              <Link href="/group-order" className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--ez-green)] text-[var(--ez-green)] font-bold text-[13px] hover:bg-[var(--ez-green)] hover:text-white transition-all shadow-sm active:scale-95 group">
                <div className="w-5 h-5 bg-[var(--ez-green-light)] rounded-full flex items-center justify-center group-hover:bg-white/20">
                  <User size={12} className="text-[var(--ez-green)]" />
                </div>
                <span>Start Group Order</span>
              </Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {isMounted && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <User size={18} className="text-gray-400" />
                  <span className="text-[13px] font-bold text-[var(--ez-gray-900)] hidden xs:block">
                    <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60]"
                    >
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <Package size={16} /> Dashboard
                      </Link>
                      {(profile?.is_admin || profile?.role === 'admin') && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                          <Lock size={16} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button 
                        onClick={() => { useAuthStore.getState().signOut(); setUserMenuOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        <X size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              isMounted && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link href="/login" className="text-[14px] font-bold text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] hidden sm:block">
                    <span>Sign In</span>
                  </Link>
                  <Link href="/login" className="ez-btn ez-btn-primary px-3 sm:px-4 py-2 text-[12px] sm:text-[13px]">
                    <span>Join</span>
                  </Link>
                </div>
              )
            )}

            {/* Cart Icon - Hidden in Admin */}
            {!isAdminPath && (
              <Link
                href="/cart"
                className="relative p-2 text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] transition-all"
              >
                <ShoppingCart size={22} />
                {isMounted && cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[var(--ez-green)] text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                    <span>{cartItemCount}</span>
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[15px] font-bold text-[var(--ez-gray-900)]"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
                {isMounted && isAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[15px] font-bold text-[var(--ez-gray-900)]"
                  >
                    <Package size={18} />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
