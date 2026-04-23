'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <CheckCircle size={80} className="text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-poppins">
          Order Confirmed!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. We've received your payment and will begin preparing 
          your catering order shortly. You'll receive a confirmation email with all the details.
        </p>

        <div className="space-y-4">
          <Link
            href="/menu"
            className="block w-full py-4 bg-forestGreen text-white font-semibold rounded-lg hover:bg-forestGreen/90 transition-smooth shadow-lg"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="block w-full py-4 bg-white text-forestGreen font-semibold rounded-lg border-2 border-forestGreen hover:bg-forestGreen/5 transition-smooth"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
