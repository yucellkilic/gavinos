'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { KeyRound, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SettingsClient() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
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

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Password successfully updated.' });
      setPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account security and admin preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-forestGreen/20 rounded-xl border border-forestGreen/30">
            <KeyRound className="text-forestGreen" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Change Admin Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
                placeholder="Confirm new password"
              />
            </div>
          </div>

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

          <div className="pt-4 border-t border-gray-700/50">
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-forestGreen hover:bg-forestGreen/90 text-white shadow-lg shadow-forestGreen/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <><Save size={18} /> Update Password</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
