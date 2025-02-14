'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Save, Archive, Code, Clock, 
  AlertCircle, FileText, Timer, Settings 
} from 'lucide-react';
import { 
  Card,
  CardContent,
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

const TestCreator = () => {
  const [test, setTest] = useState({
    title: '',
    description: '',
    status: 'DRAFT',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    content: '',
    timeLimit: 60
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accessCode, setAccessCode] = useState(null);

  const addQuestion = () => {
    const validationError = !currentQuestion.content.trim() 
      ? 'Question content is required'
      : currentQuestion.timeLimit < 30 
      ? 'Time limit must be at least 30 seconds'
      : currentQuestion.timeLimit > 300 
      ? 'Time limit cannot exceed 300 seconds'
      : null;

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

  const removeQuestion = (index) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, orderIndex: i + 1 }))
    }));
  };

  const saveTest = async (status) => {
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
      className="max-w-5xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create New Test</CardTitle>
              <p className="text-gray-500 mt-1">Design your interview questions and settings</p>
            </div>
            <Badge className={`${test.status === 'DRAFT' ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'} px-3`}>
              {test.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <Label htmlFor="title" className="font-semibold text-gray-900">Test Title</Label>
                </div>
                <Input
                  id="title"
                  value={test.title}
                  onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test title"
                  className="mt-2 bg-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Settings className="w-5 h-5 text-blue-600 mr-2" />
                  <Label htmlFor="description" className="font-semibold text-gray-900">Description</Label>
                </div>
                <Textarea
                  id="description"
                  value={test.description}
                  onChange={(e) => setTest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test description"
                  className="mt-2 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Timer className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-200 hover:border-blue-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Question</DialogTitle>
                      <DialogDescription>
                        Create a new question for your test. Questions must have content and a time limit between 30-300 seconds.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="question">Question Content</Label>
                        <Textarea
                          id="question"
                          value={currentQuestion.content}
                          onChange={(e) => setCurrentQuestion(prev => ({
                            ...prev,
                            content: e.target.value
                          }))}
                          placeholder="Enter your question"
                          className="h-32"
                        />
                      </div>
                      <div className="space-y-2">
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
                        />
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <DialogFooter className="mt-6">
                      <Button onClick={addQuestion} disabled={isSubmitting}>
                        Add Question
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="p-4">
              <AnimatePresence>
                {test.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-700 mr-2">
                            Question {question.orderIndex}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {question.timeLimit} seconds
                          </div>
                        </div>
                        <p className="text-gray-700">{question.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(index)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {test.questions.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No questions added yet. Click the "Add Question" button to get started.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {accessCode && (
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">Access Code: {accessCode}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => saveTest('DRAFT')}
                disabled={isSubmitting}
                className="border-blue-200 hover:border-blue-300"
              >
                <Archive className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => saveTest('ACTIVE')}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Publish
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestCreator;