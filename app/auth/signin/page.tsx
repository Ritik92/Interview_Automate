'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, ArrowRightIcon, UserIcon, PhoneIcon, MailIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignIn) {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Invalid email or password', {
            style: {
              border: '1px solid #FF5A5F',
              padding: '16px',
              color: '#FF5A5F',
            },
            iconTheme: {
              primary: '#FF5A5F',
              secondary: '#FFFAEE',
            },
          });
          setLoading(false);
          return;
        }

        if (result?.ok) {
          toast.success('Successfully signed in!');
          router.push('/home');
          router.refresh();
        }
      } catch (error) {
        toast.error('An error occurred during sign in');
        setLoading(false);
      }
    } else {
      if (!phone || phone.length < 10) {
        toast.error('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, phone }),
        });

        if (response.ok) {
          toast.success('Account created successfully! Please sign in.');
          setIsSignIn(true);
          // Reset form
          setEmail('');
          setPassword('');
          setPhone('');
        } else {
          const data = await response.json();
          toast.error(data.message || 'Sign up failed. Please try again.');
        }
      } catch (error) {
        toast.error('An error occurred during sign up');
      }
    }
    setLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } }
  };

  const inputClasses = "w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none";
  const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isSignIn ? 'Welcome Back' : 'Create Account'}
        </motion.h1>

        <AnimatePresence mode="wait">
          <motion.form
            key={isSignIn ? 'signin' : 'signup'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <MailIcon className={iconClasses} size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} pl-10`}
                required
                disabled={loading}
              />
            </div>

            {!isSignIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <PhoneIcon className={iconClasses} size={20} />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  required
                  disabled={loading}
                />
              </motion.div>
            )}

            <div className="relative">
              <UserIcon className={iconClasses} size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClasses} pl-10`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              } text-white font-medium transition-all duration-300`}
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRightIcon size={20} />}
            </motion.button>

            <p className="text-center text-sm text-gray-600">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  // Reset form when switching
                  setEmail('');
                  setPassword('');
                  setPhone('');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;