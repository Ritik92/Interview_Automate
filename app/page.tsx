'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, Mic, BarChart3, Users, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/NavBar';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  const stats = [
    { label: 'Active Companies', value: '500+' },
    { label: 'Candidates Evaluated', value: '50,000+' },
    { label: 'Average Time Saved', value: '70%' },
    { label: 'Satisfaction Rate', value: '98%' },
  ];

  const features = [
    {
      title: 'Automated Voice Testing',
      description: 'Questions are spoken through high-quality speakers, ensuring consistency across all candidates.',
      icon: <Mic className="w-6 h-6" />,
    },
    {
      title: 'AI-Powered Evaluation',
      description: 'Advanced AI algorithms analyze responses for technical accuracy and communication skills.',
      icon: <Brain className="w-6 h-6" />,
    },
    {
      title: 'Comprehensive Reports',
      description: 'Detailed analytics and insights for each candidate with comparative analysis.',
      icon: <BarChart3 className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className="relative pt-32 pb-24 px-4 md:px-6 lg:px-8"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Revolutionize Your <span className="text-blue-600">Technical Interviews</span>
          </motion.h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automated voice-based testing platform powered by AI. Transform your hiring process with our innovative Raspberry Pi-based solution.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform streamlines the technical interview process while ensuring fair and accurate evaluation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-blue-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Hiring Process?</h2>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
            Schedule a Demo Today
          </Button>
        </div>
      </motion.section>
    </div>
  );
}