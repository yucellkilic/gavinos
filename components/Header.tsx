'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, ChevronDown, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const { profile, isAuthenticated } = useAuth();

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
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--ez-green)] rounded-lg flex items-center justify-center text-white font-black text-xl">G</div>
              <span className="text-xl font-black text-[var(--ez-gray-900)] tracking-tighter hidden sm:block">
                <span>GAVINO'S</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 flex-1 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-bold text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] transition-colors"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isMounted && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <User size={18} className="text-gray-400" />
                  <span className="text-[13px] font-bold text-[var(--ez-gray-900)]">
                    <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              </div>
            ) : (
              isMounted && (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-[14px] font-bold text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] hidden sm:block">
                    <span>Sign In</span>
                  </Link>
                  <Link href="/login" className="ez-btn ez-btn-primary px-4 py-2 text-[13px]">
                    <span>Create Account</span>
                  </Link>
                </div>
              )
            )}

            {/* Cart Icon */}
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
