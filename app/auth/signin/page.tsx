'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="space-y-1 p-0 mb-6">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              {isSignIn ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <p className="text-center text-gray-600">
              {isSignIn 
                ? 'Enter your credentials to access your account' 
                : 'Create an account to get started'}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <motion.form
                key={isSignIn ? 'signin' : 'signup'}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                <div className="space-y-4">
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                      required
                    />
                  </div>

                  {!isSignIn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                        required
                      />
                    </motion.div>
                  )}

                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
                  disabled={loading}
                >
                  <span>{loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}</span>
                  {!loading && <ArrowRightIcon className="ml-2" size={20} />}
                </Button>

                <p className="text-center text-sm text-gray-600">
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
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {isSignIn ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </motion.form>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;