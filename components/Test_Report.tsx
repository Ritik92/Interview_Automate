'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  Clock
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
      
      // Process the reports to normalize score mappings
      const processedReports = data.reports.map(report => {
        const normalizedScores = report.scores.map((score, index) => {
          // Find the corresponding question based on index
          const questionId = data.questions[index]?.id;
          return {
            ...score,
            normalizedQuestionId: questionId
          };
        });

        return {
          ...report,
          scores: normalizedScores
        };
      });

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
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (start, end) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor((duration / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };

  const findMatchingScore = (report, questionId) => {
    if (!report?.scores) return null;
    return report.scores.find(score => score.normalizedQuestionId === questionId);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Interview Reports</CardTitle>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Export Reports
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

          {reports.length === 0 ? (
            <Alert>
              <AlertDescription>
                No interviews have been completed for this test yet.
              </AlertDescription>
            </Alert>
          ) : (
            <Accordion type="single" collapsible>
              {reports.map((report) => (
                <AccordionItem key={report.id} value={report.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center">
                        <span className="font-medium">{report.interview.candidateName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={getScoreColor(report.totalScore)}>
                          {report.totalScore.toFixed(1)}
                        </span>
                        <Badge>
                          {new Date(report.interview.completedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Interview Duration</p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDuration(
                                report.interview.startedAt,
                                report.interview.completedAt
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                          <Progress value={report.totalScore * 10} className="w-full" />
                        </div>
                      </div>

                      {report.feedback && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Overall Feedback</h4>
                          <p className="text-sm text-muted-foreground">{report.feedback}</p>
                        </div>
                      )}

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead className="w-24">Score</TableHead>
                            <TableHead>Feedback</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions.map((question) => {
                            const response = report.interview.responses.find(
                              r => r.questionId === question.id
                            );
                            const score = findMatchingScore(report, question.id);
                            
                            return (
                              <TableRow key={question.id}>
                                <TableCell className="align-top">
                                  <div className="space-y-1">
                                    <p className="font-medium">Q{question.orderIndex}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {question.content}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <p className="text-sm">{response?.transcript || 'No response'}</p>
                                    {response?.audioUrl && !response.audioUrl.startsWith('file://') && (
                                      <audio controls className="w-full">
                                        <source src={response.audioUrl} type="audio/mpeg" />
                                      </audio>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="align-top">
                                  <span className={getScoreColor(score?.score || 0)}>
                                    {score?.score.toFixed(1)}
                                  </span>
                                </TableCell>
                                <TableCell className="align-top">
                                  {score?.feedback && (
                                    <p className="text-sm text-muted-foreground">
                                      {score.feedback}
                                    </p>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestReports;