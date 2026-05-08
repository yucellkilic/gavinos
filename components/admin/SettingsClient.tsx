'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Save, CheckCircle2, AlertTriangle, Users, Mail, Loader2 } from 'lucide-react';
import { listAdminUsers, directUpdatePassword } from '@/app/actions/admin';

export default function SettingsClient() {
  const [adminUsers, setAdminUsers] = useState<{ id: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    const initSettings = async () => {
      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email || '');
        setSelectedUserId(user.id);
      }

      // Fetch all users via server action
      const result = await listAdminUsers();
      if (result.success) {
        setAdminUsers(result.users as any);
      }
      setFetchingUsers(false);
    };

    initSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password should be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    // Use Super Admin direct overwrite logic for any selected user
    const result = await directUpdatePassword(selectedUserId, password);

    if (result.success) {
      setStatus({ type: 'success', message: result.message });
      setPassword('');
      setConfirmPassword('');
    } else {
      setStatus({ type: 'error', message: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-black text-white tracking-tight">Super Admin Settings</h1>
        <p className="text-gray-400 mt-2">Directly override passwords for any administrator account.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
            <KeyRound className="text-red-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Direct Password Overwrite</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Master Access Level</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-6">
            {/* Account Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Target Account</label>
              <div className="relative">
                {fetchingUsers ? (
                  <div className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 flex items-center gap-3 text-gray-500">
                    <Loader2 className="animate-spin" size={18} /> Fetching all users...
                  </div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setStatus({ type: null, message: '' });
                    }}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
                  >
                    {adminUsers.map(user => (
                      <option key={user.id} value={user.id} className="bg-gray-900">
                        {user.email} {user.email === currentUserEmail ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <Users size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700/50">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Set new master password"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Confirm master password"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {status.type && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl flex items-center gap-3 border ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                <span className="font-medium text-sm">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Save size={20} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
