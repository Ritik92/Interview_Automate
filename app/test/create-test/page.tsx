'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Archive, Code, Clock, AlertCircle } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { TestStatus } from '@prisma/client';

type Question = {
  id: string;
  content: string;
  timeLimit: number;
  orderIndex: number;
};

type Test = {
  title: string;
  description?: string;
  status: TestStatus;
  questions: Question[];
};

const TestCreator = () => {
  const [test, setTest] = useState<Test>({
    title: '',
    description: '',
    status: 'DRAFT',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    content: '',
    timeLimit: 60
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const validateQuestion = (question: typeof currentQuestion) => {
    if (!question.content.trim()) {
      return 'Question content is required';
    }
    if (question.timeLimit < 30) {
      return 'Time limit must be at least 30 seconds';
    }
    if (question.timeLimit > 300) {
      return 'Time limit cannot exceed 300 seconds';
    }
    return null;
  };

  const addQuestion = () => {
    const validationError = validateQuestion(currentQuestion);
    if (validationError) {
      setError(validationError);
      return;
    }

    setTest(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          ...currentQuestion,
          id: crypto.randomUUID(),
          orderIndex: prev.questions.length + 1
        }
      ]
    }));
    setCurrentQuestion({ content: '', timeLimit: 60 });
    setError(null);
    setIsDialogOpen(false);
  };

  const removeQuestion = (index: number) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index).map((q, i) => ({
        ...q,
        orderIndex: i + 1
      }))
    }));
  };

  const saveTest = async (status: TestStatus) => {
    if (!test.title.trim()) {
      setError('Test title is required');
      return;
    }
    if (test.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/test', {
        ...test,
        status,
        questions: test.questions.map(q => ({
          content: q.content,
          timeLimit: q.timeLimit,
          orderIndex: q.orderIndex
        }))
      });

      setTest(prev => ({ ...prev, status: data.test.status }));
      setAccessCode(data.test.accessCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create New Test</span> 
            {/* @ts-ignore */}
            <Badge variant={test.status === 'DRAFT' ? "secondary" : "success"}>
              {test.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Test Title</Label>
              <Input
                id="title"
                value={test.title}
                onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter test title"
                className="w-full mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={test.description}
                onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter test description"
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Create a new question for your test. Questions must have content and a time limit between 30-300 seconds.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question">Question Content</Label>
                      <Textarea
                        id="question"
                        value={currentQuestion.content}
                        onChange={(e) => setCurrentQuestion(prev => ({
                          ...prev,
                          content: e.target.value
                        }))}
                        placeholder="Enter your question"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        min={30}
                        max={300}
                        value={currentQuestion.timeLimit}
                        onChange={(e) => setCurrentQuestion(prev => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value) || 60
                        }))}
                        className="mt-2"
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={addQuestion} disabled={isSubmitting}>
                      Add Question
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <AnimatePresence>
              {test.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-secondary/20 p-4 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Question {question.orderIndex}</p>
                      <p className="text-sm text-muted-foreground">{question.content}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{question.timeLimit} seconds</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center space-x-2">
            {accessCode && (
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Access Code: {accessCode}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => saveTest('DRAFT')}
              disabled={isSubmitting}
            >
              <Archive className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveTest('ACTIVE')}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Publish
            </Button>
          </div>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {test.questions.length === 0 && !error && (
        <Alert>
          <AlertDescription>
            No questions added yet. Click the "Add Question" button to get started.
          </AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
};

export default TestCreator;