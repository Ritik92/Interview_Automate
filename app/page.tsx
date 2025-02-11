'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Clock,
  ChevronRight,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import TestList from '@/components/TestList';
import TestReports from '@/components/Test_Report';

const statusColors = {
  DRAFT: 'bg-gray-200 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

const InterviewerDashboard = ({ tests, candidates }) => {
  const [selectedTest, setSelectedTest] = useState(null);

  return (
    <TestReports/>
  );
};

const StatsCard = ({ title, value, icon, description }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    case 'IN_PROGRESS':
      return <Play className="w-6 h-6 text-blue-500" />;
    case 'COMPLETED':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'CANCELLED':
      return <XCircle className="w-6 h-6 text-red-500" />;
    default:
      return null;
  }
};

export default InterviewerDashboard;