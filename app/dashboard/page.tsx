'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Package, Heart, User, Clock, CheckCircle, XCircle,
  ChevronRight, ArrowLeft, Calendar, MapPin, Phone,
  AlertTriangle, Truck, Store
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { formatCurrency } from '@/lib/utils';
import { Order, Favorite, MenuItem } from '@/types/menu';

type TabType = 'orders' | 'favorites' | 'profile';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'ez-badge-orange', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'ez-badge-green', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'ez-badge-orange', icon: Clock },
  ready: { label: 'Ready', color: 'ez-badge-green', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'ez-badge-green', icon: CheckCircle },
  completed: { label: 'Completed', color: 'ez-badge-green', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'ez-badge-red', icon: XCircle },
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<(Favorite & { menu_items: MenuItem })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Profile form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'favorites' || tab === 'profile' || tab === 'orders') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '');
      setEditPhone(profile.phone || '');
      setEditAddress(profile.address || '');
    }
  }, [profile]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await supabaseBrowser
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data || []) as Order[]);
    } catch { /* silent */ }
    setIsLoading(false);
  }, [user]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await supabaseBrowser
        .from('favorites')
        .select('*, menu_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setFavorites((data || []) as any[]);
    } catch { /* silent */ }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'favorites') fetchFavorites();
    if (activeTab === 'profile') setIsLoading(false);
  }, [activeTab, user, fetchOrders, fetchFavorites]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await supabaseBrowser
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: 'Cancelled by customer',
        })
        .eq('id', orderId)
        .eq('user_id', user!.id);
      fetchOrders();
    } catch { /* silent */ }
    setCancellingId(null);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await supabaseBrowser.from('favorites').delete().eq('id', favoriteId);
    fetchFavorites();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    const { error } = await updateProfile({
      full_name: editName,
      phone: editPhone,
      address: editAddress,
    });
    setProfileSaving(false);
    setProfileMsg(error || 'Profile updated successfully!');
  };

  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ez-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24 lg:pb-8">
      <div className="ez-container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <span>{'Welcome, '}</span><span>{profile?.full_name || 'User'}</span>
          </h1>
          <p className="text-sm text-gray-500"><span>{user?.email}</span></p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-ezGreen text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12"><div className="ez-spinner mx-auto" style={{ width: 32, height: 32 }} /></div>
                ) : orders.length === 0 ? (
                  <div className="ez-card p-12 text-center">
                    <Package size={48} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1"><span>No orders yet</span></h3>
                    <p className="text-sm text-gray-400 mb-4"><span>Your order history will appear here</span></p>
                    <Link href="/menu" className="ez-btn ez-btn-primary">
                      <span>Browse Menu</span>
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = config.icon;
                    const canCancel = ['pending', 'confirmed'].includes(order.status);
                    const orderItems = Array.isArray(order.items) ? order.items : [];

                    return (
                      <div key={order.id} className="ez-card p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-gray-400">
                                <span>{'#'}</span><span>{order.id.slice(0, 8)}</span>
                              </span>
                              <span className={`ez-badge ${config.color}`}>
                                <StatusIcon size={10} />
                                <span>{config.label}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </span>
                              {order.delivery_type && (
                                <span className="flex items-center gap-1">
                                  {order.delivery_type === 'delivery' ? <Truck size={12} /> : <Store size={12} />}
                                  <span>{order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-lg font-bold text-ezGreen">
                            <span>{formatCurrency(order.total_amount)}</span>
                          </span>
                        </div>

                        {/* Items Preview */}
                        {orderItems.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            {orderItems.slice(0, 3).map((item: any, i: number) => (
                              <div key={`item-${i}`} className="flex justify-between text-sm py-0.5">
                                <span className="text-gray-600">
                                  <span>{item?.quantity || 1}</span><span>{'× '}</span><span>{item?.name || 'Item'}</span>
                                </span>
                                <span className="text-gray-500 font-medium">
                                  <span>{formatCurrency(item?.totalPrice || 0)}</span>
                                </span>
                              </div>
                            ))}
                            {orderItems.length > 3 && (
                              <p className="text-xs text-gray-400 mt-1">
                                <span>{`+${orderItems.length - 3} more items`}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Cancel Button */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingId === order.id}
                            className="ez-btn ez-btn-danger ez-btn-sm"
                          >
                            {cancellingId === order.id ? (
                              <span className="flex items-center gap-2">
                                <div className="ez-spinner" style={{ width: 14, height: 14 }} />
                                <span>Cancelling...</span>
                              </span>
                            ) : (
                              <>
                                <AlertTriangle size={14} />
                                <span>Cancel Order</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* FAVORITES TAB */}
            {activeTab === 'favorites' && (
              <div>
                {isLoading ? (
                  <div className="text-center py-12"><div className="ez-spinner mx-auto" style={{ width: 32, height: 32 }} /></div>
                ) : favorites.length === 0 ? (
                  <div className="ez-card p-12 text-center">
                    <Heart size={48} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1"><span>No favorites yet</span></h3>
                    <p className="text-sm text-gray-400 mb-4"><span>Heart items from the menu to save them here</span></p>
                    <Link href="/menu" className="ez-btn ez-btn-primary"><span>Browse Menu</span></Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((fav) => {
                      const item = fav.menu_items;
                      if (!item) return null;
                      const price = item.item_price ?? 0;
                      return (
                        <div key={fav.id} className="ez-card p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                              <span>{item.item_name || 'Item'}</span>
                            </h4>
                            <button
                              onClick={() => handleRemoveFavorite(fav.id)}
                              className="ez-heart active flex-shrink-0"
                            >
                              <Heart size={16} fill="#ef4444" />
                            </button>
                          </div>
                          {item.category_name && (
                            <span className="ez-badge ez-badge-green text-[10px] mb-2">
                              <span>{item.category_name}</span>
                            </span>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-base font-bold text-ezGreen">
                              {price > 0 ? <span>${price.toFixed(2)}</span> : <span className="text-sm text-gray-500">Market Price</span>}
                            </span>
                            <Link href={`/menu/${item.id}`} className="ez-btn ez-btn-primary ez-btn-sm">
                              <span>View</span>
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="max-w-lg">
                <div className="ez-card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4"><span>Edit Profile</span></h3>

                  {profileMsg && (
                    <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${
                      profileMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span>{profileMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Full Name</span></label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="ez-input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Phone</span></label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="ez-input"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5"><span>Default Address</span></label>
                      <textarea
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="ez-textarea"
                        placeholder="123 Main St, City, State"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="ez-btn ez-btn-primary w-full ez-btn-lg disabled:opacity-60"
                    >
                      {profileSaving ? (
                        <span className="flex items-center gap-2">
                          <div className="ez-spinner" />
                          <span>Saving...</span>
                        </span>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
