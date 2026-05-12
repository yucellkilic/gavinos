'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isMounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error);
        } else {
          // If we are authenticated now, it means auto-login worked
          setSuccess('Account created successfully!');
          // The useEffect will handle redirection, but let's be explicit
          setTimeout(() => router.push('/dashboard'), 1000);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          router.push('/dashboard');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to Menu */}
        <Link
          href="/menu"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-ezGreen mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>

        {/* Card */}
        <div className="ez-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-ezGreen rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span>{isRegister ? 'Create Account' : 'Welcome Back'}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              <span>{isRegister ? 'Join us to start ordering' : 'Sign in to your account'}</span>
            </p>
          </div>

          {/* Error/Success */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              <span>{success}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span>Full Name</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="ez-input pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span>Email</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="ez-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span>Password</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="ez-input pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="ez-btn ez-btn-primary w-full ez-btn-lg mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="ez-spinner" />
                  <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                </span>
              ) : (
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              <span>{isRegister ? 'Already have an account? ' : "Don't have an account? "}</span>
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
                className="text-ezGreen font-semibold hover:underline"
              >
                <span>{isRegister ? 'Sign In' : 'Create Account'}</span>
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
