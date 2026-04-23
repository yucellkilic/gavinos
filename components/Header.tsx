'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartItemCount = items.length;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-header">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-forestGreen hover:bg-forestGreen/10 transition-smooth"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3">
            <Image 
              src="/images/logo.png" 
              alt="Gavino's Pizza Logo" 
              width={50} 
              height={50}
              className="object-contain"
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-forestGreen font-poppins tracking-tight">
              GAVINO'S PIZZA
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-forestGreen font-semibold transition-smooth"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 rounded-md text-forestGreen hover:bg-forestGreen/10 transition-smooth"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-classicRed text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              >
                {cartItemCount}
              </motion.span>
            )}
          </Link>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-forestGreen/10 hover:text-forestGreen rounded-xl font-semibold transition-smooth"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
