'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Address',
      content: '528 Chartiers Ave., McKees Rocks, PA 15136'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone',
      content: '(412) 331-3700'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      content: 'info@gavinospizza.com'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Hours',
      content: 'Mon-Sat: 10AM-8PM, Sun: 11AM-6PM'
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
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-semibold">
            Have questions about our catering services? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="card-3d p-6 rounded-2xl flex items-start gap-4"
              >
                <div className="text-forestGreen mt-1">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-forestGreen mb-1">
                    {info.title}
                  </h3>
                  <p className="text-gray-700 font-semibold">
                    {info.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="card-3d p-8 rounded-3xl"
          >
            <h2 className="text-2xl font-black text-forestGreen mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-forestGreen focus:outline-none transition-smooth font-semibold"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-forestGreen focus:outline-none transition-smooth font-semibold"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-forestGreen focus:outline-none transition-smooth font-semibold"
                  placeholder="(412) 555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-forestGreen focus:outline-none transition-smooth font-semibold resize-none"
                  placeholder="Tell us about your event..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full premium-button text-white font-black text-lg py-4 rounded-full"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
