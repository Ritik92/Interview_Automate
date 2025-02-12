'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Product',
      dropdownItems: ['Features', 'Integration', 'Security', 'Enterprise'],
    },
    {
      label: 'Solutions',
      dropdownItems: ['Technical Interviews', 'Assessment', 'Reporting', 'Analytics'],
    },
    { label: 'Pricing' },
    { label: 'Resources' },
  ];

  const NavLink = ({ item }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">
          {item.label}
          {item.dropdownItems && <ChevronDown className="ml-1 w-4 h-4" />}
        </button>

        {item.dropdownItems && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
          >
            {item.dropdownItems.map((dropdownItem) => (
              <a
                key={dropdownItem}
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
              >
                {dropdownItem}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <span className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 cursor-pointer">
              InterviewAI
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={() => router.push('/auth/signin')}
              variant="ghost"
              className="text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white/95 backdrop-blur-md">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <button className="text-left py-2 text-lg font-medium text-gray-700 hover:text-blue-600">
                        {item.label}
                      </button>
                      {item.dropdownItems && (
                        <div className="ml-4 mt-2 flex flex-col space-y-2">
                          {item.dropdownItems.map((dropdownItem) => (
                            <a
                              key={dropdownItem}
                              href="#"
                              className="text-gray-600 hover:text-blue-600"
                            >
                              {dropdownItem}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="pt-4 space-y-4">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;