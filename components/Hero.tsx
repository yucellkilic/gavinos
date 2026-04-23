'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-9xl">🍕</div>
        <div className="absolute bottom-20 right-10 text-9xl">🍝</div>
        <div className="absolute top-1/2 left-1/4 text-7xl">🍷</div>
        <div className="absolute top-1/3 right-1/4 text-7xl">🧀</div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-black text-forestGreen mb-6">
            Artisan Italian Catering
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-gray-700 font-semibold max-w-3xl mx-auto leading-relaxed">
            From intimate gatherings to grand celebrations, our premium catering service
            brings the authentic taste of Italy to your table. Every dish is crafted with passion,
            precision, and the finest ingredients.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { emoji: '🍕', title: 'Premium Quality', desc: 'Only the finest ingredients, sourced with care and prepared with expertise.' },
              { emoji: '⏰', title: 'Master Craftsmanship', desc: 'Every dish is a work of art, created by skilled culinary artisans.' },
              { emoji: '🎉', title: 'Perfect Events', desc: 'From corporate events to weddings, we make every occasion memorable.' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="card-3d p-8 rounded-3xl text-center"
              >
                <div className="text-6xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-black text-forestGreen mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-semibold text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-12"
          >
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="premium-button text-white font-black text-lg px-10 py-4 rounded-full"
              >
                Explore Our Menu
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
