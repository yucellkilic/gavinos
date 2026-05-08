'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Save, CheckCircle2, AlertTriangle, Users, Mail, Loader2 } from 'lucide-react';
import { listAdminUsers, sendPasswordReset } from '@/app/actions/admin';

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

      // Fetch all admin users via server action
      const result = await listAdminUsers();
      if (result.success) {
        setAdminUsers(result.users as any);
      }
      setFetchingUsers(false);
    };

    initSettings();
  }, []);

  const isSelf = adminUsers.find(u => u.id === selectedUserId)?.email === currentUserEmail;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    if (isSelf) {
      // Self-update logic
      if (password !== confirmPassword) {
        setStatus({ type: 'error', message: 'Passwords do not match.' });
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setStatus({ type: 'error', message: 'Password should be at least 6 characters.' });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus({ type: 'error', message: error.message });
      } else {
        setStatus({ type: 'success', message: 'Your password has been updated successfully.' });
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      // Reset link logic for others
      const targetUser = adminUsers.find(u => u.id === selectedUserId);
      if (targetUser?.email) {
        const result = await sendPasswordReset(targetUser.email);
        if (result.success) {
          setStatus({ type: 'success', message: result.message });
        } else {
          setStatus({ type: 'error', message: result.message || 'Failed to send reset link.' });
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-black text-white tracking-tight">Security Settings</h1>
        <p className="text-gray-400 mt-2">Manage authentication and access for all administrators.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-forestGreen/20 rounded-xl border border-forestGreen/30">
            <Users className="text-forestGreen" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Account Management</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Select an account to modify</p>
          </div>
        </div>

        <form onSubmit={handleAction} className="space-y-6">
          <div className="space-y-6">
            {/* Account Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Admin Account</label>
              <div className="relative">
                {fetchingUsers ? (
                  <div className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 flex items-center gap-3 text-gray-500">
                    <Loader2 className="animate-spin" size={18} /> Loading accounts...
                  </div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setStatus({ type: null, message: '' });
                    }}
                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all appearance-none cursor-pointer"
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

            <AnimatePresence mode="wait">
              {isSelf ? (
                <motion.div 
                  key="self-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-700/50"
                >
                  <div className="flex items-center gap-2 text-forestGreen mb-4">
                    <KeyRound size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Update Your Password</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="other-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-gray-700/50"
                >
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4">
                    <Mail className="text-blue-400 mt-1 shrink-0" size={24} />
                    <div>
                      <h4 className="text-blue-400 font-bold text-sm">Security Policy</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        For security reasons, you cannot directly change another admin's password. 
                        Click below to send them a secure <strong>password reset link</strong> to their registered email.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              disabled={loading || (isSelf && (!password || !confirmPassword))}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelf 
                  ? 'bg-forestGreen hover:bg-forestGreen/90 text-white shadow-forestGreen/20' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSelf ? <Save size={20} /> : <Mail size={20} />}
                  {isSelf ? 'Update My Password' : 'Send Reset Link'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
