'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/priceCalculator';
import StripePaymentForm from '@/components/StripePaymentForm';

type PaymentMethod = 'stripe' | 'square' | 'apple_pay' | 'google_pay';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('stripe');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/menu');
    }
  }, [items, router]);

  const initializePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (selectedPayment === 'stripe') {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalPrice }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        setClientSecret(data.clientSecret);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPayment === 'stripe' && totalPrice > 0) {
      initializePayment();
    }
  }, [selectedPayment, totalPrice]);

  const handlePaymentSuccess = () => {
    clearCart();
    router.push('/order-confirmation');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-forestGreen hover:text-forestGreen/80 mb-6 transition-smooth"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Cart
        </button>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 font-poppins">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
                    <div className="text-2xl">🍕</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.numberOfPeople} people × {item.quantity} qty
                    </p>
                    <p className="text-sm font-bold text-forestGreen mt-1">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t-2 border-forestGreen">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-forestGreen">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setSelectedPayment('stripe')}
                className={`p-4 rounded-lg border-2 transition-smooth ${
                  selectedPayment === 'stripe'
                    ? 'border-forestGreen bg-forestGreen/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="mx-auto mb-2" size={24} />
                <span className="text-sm font-semibold">Credit Card</span>
              </button>

              <button
                onClick={() => setSelectedPayment('apple_pay')}
                disabled
                className="p-4 rounded-lg border-2 border-gray-200 opacity-50 cursor-not-allowed"
              >
                <Smartphone className="mx-auto mb-2" size={24} />
                <span className="text-sm font-semibold">Apple Pay</span>
                <span className="block text-xs text-gray-500 mt-1">Coming Soon</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Payment Form */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forestGreen mx-auto"></div>
                  <p className="text-gray-600 mt-4">Initializing payment...</p>
                </div>
              ) : selectedPayment === 'stripe' && clientSecret ? (
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a payment method to continue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
