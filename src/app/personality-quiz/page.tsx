import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { useCareerGuidanceContext } from '@/contexts/CareerGuidanceContext';
import { PersonalityResponse } from '@/types/career';
import personalityQuestions from '@/data/personality-questions.json';
import { useToast } from '@/hooks/use-toast';

const QUESTIONS_PER_SECTION = 8;
const SECTIONS = [
  { title: 'Interests & Preferences', questions: personalityQuestions.slice(0, 8) },
  { title: 'Work Style & Motivation', questions: personalityQuestions.slice(8, 16) },
  { title: 'Problem-Solving & Thinking', questions: personalityQuestions.slice(16, 24) },
  { title: 'Personality Traits', questions: personalityQuestions.slice(24, 32) },
  { title: 'Learning & Study Preferences', questions: personalityQuestions.slice(32, 40) },
];

export default function Page() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { savePersonalityResponses } = useCareerGuidanceContext();
  const { toast } = useToast();

  const totalQuestions = personalityQuestions.length;
  const answeredQuestions = Object.keys(responses).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  const handleResponseChange = (questionId: number, rating: number) => {
    setResponses(prev => ({ ...prev, [questionId]: rating }));
  };

  const canGoToNextSection = () => {
    const currentSectionQuestions = SECTIONS[currentSection].questions;
    return currentSectionQuestions.every(q => responses[q.id] !== undefined);
  };

  const canGoToPrevSection = () => {
    return currentSection > 0;
  };

  const nextSection = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      const personalityResponses: PersonalityResponse[] = Object.entries(responses).map(
        ([questionId, rating]) => ({
          questionId: parseInt(questionId),
          rating
        })
      );
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      savePersonalityResponses(personalityResponses);
      
      toast({
        title: "Personality assessment completed!",
        description: "Your profile has been analyzed. Continuing to degree recommendations...",
      });
      
      // Navigate to next page
      setTimeout(() => {
        window.location.href = '/qualifying-degrees';
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSectionData = SECTIONS[currentSection];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TypingAnimation 
            text="Discover Your Personality & Career Match"
            className="text-2xl font-bold text-gradient mb-4"
          />
          <p className="text-muted-foreground text-lg">
            Answer these questions honestly to help us recommend the best career paths for you.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {answeredQuestions} of {totalQuestions} questions
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-6" />
          
          {/* Section Progress */}
          <div className="flex items-center justify-center gap-4">
            {SECTIONS.map((section, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={`progress-step ${
                  index < currentSection ? 'completed' : 
                  index === currentSection ? 'active' : 'disabled'
                }`}>
                  {index < currentSection ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-center max-w-20">{section.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Section */}
        <Card className="mb-8 border-beam">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              Section {currentSection + 1}: {currentSectionData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSectionData.questions.map((question, index) => (
              <div key={question.id} className="p-4 rounded-lg border bg-card/50">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">
                    Question {(currentSection * QUESTIONS_PER_SECTION) + index + 1}
                  </h3>
                  <p className="text-foreground">{question.question}</p>
                </div>
                
                <RadioGroup
                  value={responses[question.id]?.toString()}
                  onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
                  className="flex items-center gap-6"
                >
                  <div className="text-sm text-muted-foreground">Strongly Disagree</div>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center gap-1">
                      <RadioGroupItem value={rating.toString()} id={`q${question.id}-${rating}`} />
                      <Label 
                        htmlFor={`q${question.id}-${rating}`} 
                        className="text-xs cursor-pointer"
                      >
                        {rating}
                      </Label>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground">Strongly Agree</div>
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={!canGoToPrevSection()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Section
          </Button>

          {currentSection < SECTIONS.length - 1 ? (
            <Button
              onClick={nextSection}
              disabled={!canGoToNextSection()}
              className="flex items-center gap-2 gradient-primary text-white border-0"
            >
              Next Section
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={!canGoToNextSection() || isSubmitting}
              className="flex items-center gap-2 gradient-primary text-white border-0"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  Complete Assessment
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}