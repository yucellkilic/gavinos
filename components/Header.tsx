'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, Heart, Package, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const { user, profile, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemCount = isMounted ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <header className="ez-header sticky top-0 z-50" suppressHydrationWarning>
      <nav className="ez-container">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden ez-btn-icon ez-btn-ghost"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="Gavino's Pizza Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-lg lg:text-xl font-bold text-ezGreen tracking-tight">
              <span>{"GAVINO'S"}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-ezGreen rounded-lg hover:bg-ezGreen-light/50 transition-all"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-gray-600 hover:text-ezGreen hover:bg-ezGreen-light/50 transition-all"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {isMounted && cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-ezGreen text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  <span>{cartItemCount}</span>
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isMounted && isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-lg text-gray-600 hover:text-ezGreen hover:bg-ezGreen-light/50 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-ezGreen text-white flex items-center justify-center text-xs font-bold">
                    <span>{(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown size={14} className="hidden lg:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-ez-lg border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            <span>{profile?.full_name || 'User'}</span>
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            <span>{user?.email}</span>
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Package size={16} />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/dashboard?tab=favorites"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Heart size={16} />
                            <span>Favorites</span>
                          </Link>
                          <Link
                            href="/dashboard?tab=profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User size={16} />
                            <span>Profile</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              isMounted && (
                <Link
                  href="/login"
                  className="ez-btn ez-btn-primary ez-btn-sm"
                >
                  <span>Sign In</span>
                </Link>
              )
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
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-ezGreen-light hover:text-ezGreen rounded-lg font-medium transition-all"
                  >
                    <span>{link.label}</span>
                  </Link>
                ))}
                {isMounted && isAuthenticated && (
                  <>
                    <div className="border-t border-gray-100 my-2" />
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-ezGreen-light hover:text-ezGreen rounded-lg font-medium transition-all"
                    >
                      <Package size={18} />
                      <span>Dashboard</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
