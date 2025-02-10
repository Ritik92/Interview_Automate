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
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Tests"
            value={tests?.length || 0}
            icon={<FileText className="w-6 h-6" />}
            description="Active and draft tests"
          />
          <StatsCard
            title="Total Candidates"
            value={candidates?.length || 0}
            icon={<Users className="w-6 h-6" />}
            description="Across all tests"
          />
          <StatsCard
            title="Pending Reviews"
            value={candidates?.filter(c => c.status === 'COMPLETED' && !c.answers.some(a => a.score))?.length || 0}
            icon={<Clock className="w-6 h-6" />}
            description="Interviews needing review"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests?.map(test => (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedTest(test.id)}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span className="truncate">{test.title}</span>
                        <Badge className={statusColors[test.status]}>
                          {test.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Questions</span>
                          <span>{test.questions?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Candidates</span>
                          <span>{test.candidates?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Access Code</span>
                          <span className="font-mono">{test.accessCode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {candidates?.map(candidate => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <StatusIcon status={candidate.status} />
                          <div>
                            <h3 className="font-medium">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">
                              Test: {tests?.find(t => t.id === candidate.testId)?.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={statusColors[candidate.status]}>
                            {candidate.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
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