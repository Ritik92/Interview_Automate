'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  Download,
  Clock,
  ChevronRight,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const TestReports = () => {
  const params = useParams();
  const [reports, setReports] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [params.testId]);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get(`/api/test/${params.testId}/reports`);
      const processedReports = data.reports.map(report => ({
        ...report,
        scores: report.scores.map((score, index) => ({
          ...score,
          normalizedQuestionId: data.questions[index]?.id
        }))
      }));
      setReports(processedReports);
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-blue-600 text-white';
    if (score >= 6) return 'bg-blue-500 text-white';
    return 'bg-blue-400 text-white';
  };

  const formatDuration = (start, end) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor((duration / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  const findMatchingScore = (report, questionId) => {
    return report?.scores?.find(score => score.normalizedQuestionId === questionId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Test Reports</CardTitle>
              <p className="text-gray-500 mt-1">View and analyze candidate performance</p>
            </div>
            <Button variant="outline" className="border-blue-200 hover:border-blue-300">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {reports.length === 0 ? (
            <Alert>
              <AlertDescription>
                No interviews have been completed for this test yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem 
                    value={report.id} 
                    className="border border-gray-100 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-200"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="grid grid-cols-3 w-full gap-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {report.interview.candidateName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">{report.interview.candidateName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(report.interview.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            {formatDuration(report.interview.startedAt, report.interview.completedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-end">
                          <Badge className={`${getScoreColor(report.totalScore)} text-sm px-3`}>
                            Score: {report.totalScore.toFixed(1)}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                              <h3 className="font-semibold text-gray-900">Performance Overview</h3>
                            </div>
                            <Progress 
                              value={report.totalScore * 10} 
                              className="h-2 mt-2"
                            />
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                              <h3 className="font-semibold text-gray-900">Overall Feedback</h3>
                            </div>
                            <p className="text-gray-600 text-sm">{report.feedback || 'No feedback provided'}</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-100">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="w-1/3">Question</TableHead>
                                <TableHead className="w-1/3">Response</TableHead>
                                <TableHead className="w-1/6">Score</TableHead>
                                <TableHead className="w-1/6">Feedback</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {questions.map((question, qIndex) => {
                                const response = report.interview.responses.find(
                                  r => r.questionId === question.id
                                );
                                const score = findMatchingScore(report, question.id);
                                
                                return (
                                  <TableRow key={question.id} className="hover:bg-gray-50">
                                    <TableCell className="align-top">
                                      <span className="font-medium text-blue-600 block mb-1">
                                        Question {qIndex + 1}
                                      </span>
                                      <p className="text-gray-600 text-sm">{question.content}</p>
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-2">
                                        <p className="text-sm text-gray-700">{response?.transcript || 'No response'}</p>
                                        {response?.audioUrl && !response.audioUrl.startsWith('file://') && (
                                          <audio 
                                            controls 
                                            className="w-full h-8 mt-2"
                                          >
                                            <source src={response.audioUrl} type="audio/mpeg" />
                                          </audio>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                      <Badge className={getScoreColor(score?.score || 0)}>
                                        {score?.score.toFixed(1)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="align-top">
                                      <p className="text-sm text-gray-600">{score?.feedback}</p>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestReports;