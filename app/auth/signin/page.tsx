'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, ArrowRightIcon, UserIcon, MailIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'INTERVIEWER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignIn) {
      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast({
            title: "Error",
            description: "Invalid email or password",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (result?.ok) {
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          router.push('/dashboard');
          router.refresh();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred during sign in",
          variant: "destructive",
        });
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Account created successfully! Please sign in.",
          });
          setIsSignIn(true);
          setFormData({
            email: '',
            name: '',
            password: '',
            role: 'INTERVIEWER'
          });
        } else {
          const data = await response.json();
          toast({
            title: "Error",
            description: data.message || 'Sign up failed. Please try again.',
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred during sign up",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } }
  };

  const inputClasses = "w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none";
  const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <motion.h1 
          className="text-3xl font-bold mb-6 text-center text-primary"
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
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                <UserIcon className={iconClasses} size={20} />
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`${inputClasses} pl-10`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  ? 'bg-muted cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90'
              } text-primary-foreground font-medium transition-all duration-300`}
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRightIcon size={20} />}
            </motion.button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setFormData({
                    email: '',
                    name: '',
                    password: '',
                    role: 'INTERVIEWER'
                  });
                }}
                className="text-primary hover:text-primary/90 font-medium transition-colors"
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