'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  const features = [
    {
      icon: '🍕',
      title: 'Artisan Quality',
      description: 'Every dish is handcrafted with premium ingredients and traditional Italian techniques.'
    },
    {
      icon: '⏰',
      title: 'Since 2012',
      description: 'Over a decade of experience serving Pittsburgh with authentic Italian catering.'
    },
    {
      icon: '🎉',
      title: 'Perfect Events',
      description: 'From intimate gatherings to grand celebrations, we make every occasion special.'
    },
    {
      icon: '👨‍🍳',
      title: 'Expert Team',
      description: 'Our skilled culinary team brings passion and precision to every event.'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-6xl font-black text-forestGreen mb-6">
            About Gavino's Pizza
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
            Pittsburgh's premier Italian catering service, bringing authentic flavors 
            and artisan quality to your special events since 2012.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="card-3d p-8 lg:p-12 rounded-3xl mb-16"
        >
          <h2 className="text-3xl font-black text-forestGreen mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 font-semibold text-lg leading-relaxed">
            <p>
              Founded in 2012, Gavino's Pizza has been serving the Pittsburgh community 
              with authentic Italian catering that combines traditional recipes with 
              modern culinary excellence.
            </p>
            <p>
              Our passion for quality ingredients and artisan craftsmanship has made us 
              the preferred choice for weddings, corporate events, and celebrations 
              throughout the region.
            </p>
            <p>
              Every dish we create tells a story of Italian heritage, prepared with 
              care and served with pride. From our kitchen to your table, we bring 
              the authentic taste of Italy to every event.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="card-3d p-8 rounded-3xl text-center"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-black text-forestGreen mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-semibold text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-black text-forestGreen mb-6">
            Ready to Make Your Event Special?
          </h2>
          <a href="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="premium-button text-white font-black text-lg px-10 py-4 rounded-full"
            >
              Explore Our Menu
            </motion.button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
