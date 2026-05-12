'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import StripePaymentForm from '@/components/StripePaymentForm';
import { supabaseBrowser } from '@/lib/supabase-browser';

type PaymentMethod = 'stripe' | 'square' | 'apple_pay' | 'google_pay';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, deliveryDetails, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('stripe');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && items.length === 0) {
      router.push('/menu');
    }
  }, [items, router, isMounted]);

  const initializePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (selectedPayment === 'stripe') {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to initialize payment');
        }

        setClientSecret(data?.clientSecret || '');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && selectedPayment === 'stripe' && typeof totalPrice === 'number' && totalPrice > 0) {
      initializePayment();
    }
  }, [selectedPayment, totalPrice, isMounted]);

  const handlePaymentSuccess = async () => {
    try {
      // Save order to Supabase with full details
      const orderData: any = {
        total_amount: totalPrice,
        items: items.map(item => ({
          name: item?.name,
          base_price: item?.base_price,
          quantity: item?.quantity,
          numberOfPeople: item?.numberOfPeople,
          selected_modifiers: item?.selected_modifiers ?? [],
          special_instructions: item?.special_instructions ?? '',
          totalPrice: item?.totalPrice,
        })),
        status: 'pending',
        delivery_type: deliveryDetails?.deliveryType || 'delivery',
        delivery_address: deliveryDetails?.address || null,
        delivery_date: deliveryDetails?.deliveryDate || null,
        delivery_time: deliveryDetails?.deliveryTime || null,
        phone: deliveryDetails?.phoneNumber || null,
      };

      // If user is authenticated, attach user_id
      if (user) {
        orderData.user_id = user.id;
      }

      const { data: order, error: dbError } = await supabaseBrowser
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (dbError) {
        console.error('Error saving order:', dbError);
      }

      // If order created and user exists, save order_items too
      if (order && user) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menuItemId || null,
          item_name: item.name || 'Item',
          base_price: item.base_price || 0,
          quantity: item.quantity || 1,
          number_of_people: item.numberOfPeople || 1,
          selected_modifiers: item.selected_modifiers || [],
          special_instructions: item.special_instructions || null,
          line_total: item.totalPrice || 0,
        }));

        await supabaseBrowser.from('order_items').insert(orderItems);
      }
    } catch (err) {
      console.error('Exception saving order:', err);
    }

    clearCart();
    router.push('/order-confirmation');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage || 'Payment failed');
  };

  if (!isMounted || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24 lg:pb-8">
      <div className="ez-container py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-ezGreen mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          <span>Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div>
            <div className="ez-card p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4"><span>Order Summary</span></h2>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item?.id || Math.random().toString()} className="flex gap-3 py-3">
                    <div className="w-12 h-12 rounded-lg bg-ezGreen-light flex items-center justify-center flex-shrink-0 text-xl">
                      <span>{item?.image_url || '🍕'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                        <span>{item?.name || 'Item'}</span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        <span>{item?.numberOfPeople || 1}</span><span>{' ppl × '}</span><span>{item?.quantity || 1}</span><span>{' qty'}</span>
                      </p>
                      {Array.isArray(item?.selected_modifiers) && item.selected_modifiers.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.selected_modifiers.map((mod, i) => (
                            <span key={`mod-${i}`} className="text-[10px] text-ezGreen bg-ezGreen-light px-1.5 py-0.5 rounded">
                              <span>{mod?.modifier_name || 'Extra'}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {item.special_instructions && (
                        <p className="text-[11px] text-ezOrange mt-1 italic">
                          <span>{'📝 '}</span><span>{item.special_instructions}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-ezGreen flex-shrink-0">
                      <span>{formatCurrency(item?.totalPrice ?? 0)}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-ezGreen pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900"><span>Total</span></span>
                  <span className="text-xl font-bold text-ezGreen">
                    <span>{formatCurrency(totalPrice ?? 0)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <div className="ez-card p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4"><span>Payment Method</span></h2>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSelectedPayment('stripe')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPayment === 'stripe'
                      ? 'border-ezGreen bg-ezGreen-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="mx-auto mb-2 text-ezGreen" size={24} />
                  <span className="text-sm font-semibold block"><span>Credit Card</span></span>
                </button>

                <button
                  disabled
                  className="p-4 rounded-lg border-2 border-gray-200 opacity-40 cursor-not-allowed"
                >
                  <Smartphone className="mx-auto mb-2" size={24} />
                  <span className="text-sm font-semibold block"><span>Apple Pay</span></span>
                  <span className="block text-[10px] text-gray-400 mt-1"><span>Coming Soon</span></span>
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-4">
                <ShieldCheck size={16} className="text-ezGreen flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  <span>Your payment info is encrypted and secure</span>
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
                >
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Payment Form */}
              <div>
                {totalPrice === null ? (
                  <div className="text-center py-8">
                    <p className="text-base font-semibold text-gray-900 mb-2"><span>Custom Pricing Required</span></p>
                    <p className="text-sm text-gray-500 mb-4">
                      <span>Your order includes items that require custom pricing.</span>
                    </p>
                    <button
                      onClick={() => window.location.href = 'mailto:info@gavinospizza.com?subject=Pricing Inquiry'}
                      className="ez-btn ez-btn-primary"
                    >
                      <span>Contact for Pricing</span>
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-8">
                    <div className="ez-spinner mx-auto mb-3" style={{ width: 32, height: 32 }} />
                    <p className="text-sm text-gray-500"><span>Initializing payment...</span></p>
                  </div>
                ) : selectedPayment === 'stripe' && clientSecret ? (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    <span>Select a payment method to continue</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
