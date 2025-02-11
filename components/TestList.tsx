'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Archive, 
  Clock, 
  Code, 
  MoreVertical, 
  Pencil, 
  Play, 
  Plus,
  AlertCircle 
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { TestStatus } from '@prisma/client';

type Test = {
  id: string;
  title: string;
  description?: string;
  status: TestStatus;
  accessCode: string;
  questions: Array<{
    id: string;
    content: string;
    timeLimit: number;
  }>;
  createdAt: string;
  _count: {
    interviews: number;
  };
};

const TestList = () => {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get('/api/test');
      setTests(data.tests);
      setError(null);
    } catch (err) {
      setError('Failed to load tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId: string, status: TestStatus) => {
    try {
      await axios.patch(`/api/test/${testId}`, { status });
      fetchTests(); // Refresh the list
    } catch (err) {
      setError('Failed to update test status');
      console.error('Error updating test status:', err);
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'secondary';
      case 'COMPLETED':
        return 'default';
      case 'ARCHIVED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Tests</CardTitle>
            <Button onClick={() => router.push('/create-test')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tests.length === 0 ? (
            <Alert>
              <AlertDescription>
                No tests found. Create your first test to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Interviews</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {test.questions.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        {test.accessCode}
                      </div>
                    </TableCell>
                    <TableCell>{test._count.interviews}</TableCell>
                    <TableCell>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/tests/${test.id}`)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {test.status === 'DRAFT' && (
                            <DropdownMenuItem
                              onClick={() => updateTestStatus(test.id, 'ACTIVE')}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {test.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => updateTestStatus(test.id, 'ARCHIVED')}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestList;