'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Archive, Code, Clock } from 'lucide-react';
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
    status: 'DRAFT',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    content: '',
    timeLimit: 60
  });
  const [accessCode, setAccessCode] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const addQuestion = () => {
    if (currentQuestion.content.trim()) {
      setTest(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion, id: crypto.randomUUID() }]
      }));
      setCurrentQuestion({ content: '', timeLimit: 60 });
    }
  };

  const removeQuestion = (index) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const saveTest = async (status) => {
    try {
      const testToSave = { ...test, status };
      const { data } = await axios.post('/api/test', testToSave);
      setTest(prev => ({ ...prev, status: data.status }));
      setAccessCode(data.accessCode);
    } catch (error) {
      console.error('Error saving test:', error);
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
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              value={test.title}
              onChange={(e) => setTest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter test title"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Dialog>
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
                      Create a new question for your test
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
                        value={currentQuestion.timeLimit}
                        onChange={(e) => setCurrentQuestion(prev => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value)
                        }))}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={addQuestion} className="w-full">
                      Add Question
                    </Button>
                  </div>
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
                      <p className="font-medium">Question {index + 1}</p>
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
            >
              <Archive className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveTest('ACTIVE')}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Publish
            </Button>
          </div>
        </CardFooter>
      </Card>

      {test.questions.length === 0 && (
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