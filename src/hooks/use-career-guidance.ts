import { useState, useCallback } from 'react';
import { NavigationStep, AcademicResult, PersonalityResponse, PersonalityProfile, Degree } from '@/types/career';
import personalityQuestions from '@/data/personality-questions.json';

export const useCareerGuidance = () => {
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([
    {
      id: 'upload-results',
      title: 'Upload Results',
      icon: 'Upload',
      completed: false,
      disabled: false,
      path: '/upload-results'
    },
    {
      id: 'personality-quiz',
      title: 'Personality Quiz',
      icon: 'Brain',
      completed: false,
      disabled: true,
      path: '/personality-quiz'
    },
    {
      id: 'qualifying-degrees',
      title: 'Qualifying Degrees',
      icon: 'GraduationCap',
      completed: false,
      disabled: true,
      path: '/qualifying-degrees'
    },
    {
      id: 'gap-analysis',
      title: 'Gap Analysis',
      icon: 'Target',
      completed: false,
      disabled: true,
      path: '/gap-analysis'
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: 'MessageCircle',
      completed: false,
      disabled: true,
      path: '/ai-assistant'
    }
  ]);

  const [academicResults, setAcademicResults] = useState<AcademicResult[]>([]);
  const [personalityResponses, setPersonalityResponses] = useState<PersonalityResponse[]>([]);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [qualifyingDegrees, setQualifyingDegrees] = useState<Degree[]>([]);

  const updateStepCompletion = useCallback((stepId: string, completed: boolean) => {
    setNavigationSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return { ...step, completed };
      }
      return step;
    }));

    // Enable next step when current step is completed
    if (completed) {
      setNavigationSteps(prev => {
        const stepIndex = prev.findIndex(s => s.id === stepId);
        if (stepIndex < prev.length - 1) {
          return prev.map((step, index) => {
            if (index === stepIndex + 1) {
              return { ...step, disabled: false };
            }
            return step;
          });
        }
        return prev;
      });
    }
  }, []);

  const saveAcademicResults = useCallback((results: AcademicResult[]) => {
    setAcademicResults(results);
    updateStepCompletion('upload-results', results.length > 0);
  }, [updateStepCompletion]);

  const savePersonalityResponses = useCallback((responses: PersonalityResponse[]) => {
    setPersonalityResponses(responses);
    
    // Calculate personality profile
    const profile = calculatePersonalityProfile(responses);
    setPersonalityProfile(profile);
    
    updateStepCompletion('personality-quiz', responses.length === personalityQuestions.length);
  }, [updateStepCompletion]);

  const calculatePersonalityProfile = (responses: PersonalityResponse[]): PersonalityProfile => {
    const categoryScores: Record<string, number[]> = {};
    const careerPathScores: Record<string, number> = {};

    responses.forEach(response => {
      const question = personalityQuestions.find(q => q.id === response.questionId);
      if (!question) return;

      // Track category scores
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = [];
      }
      categoryScores[question.category].push(response.rating);

      // Track career path scores
      question.career_paths.forEach(path => {
        if (!careerPathScores[path]) {
          careerPathScores[path] = 0;
        }
        careerPathScores[path] += response.rating;
      });
    });

    // Calculate category averages
    const categories: Record<string, number> = {};
    Object.entries(categoryScores).forEach(([category, scores]) => {
      categories[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Get top career paths
    const topCareerPaths = Object.entries(careerPathScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path]) => path);

    // Determine strengths and work style
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a);

    const strengths = sortedCategories
      .slice(0, 3)
      .map(([category]) => category);

    const workStyle = determineWorkStyle(categories);

    return {
      categories,
      topCareerPaths,
      strengths,
      workStyle
    };
  };

  const determineWorkStyle = (categories: Record<string, number>): string => {
    const independent = categories['Independent'] || 0;
    const teamwork = categories['Teamwork'] || 0;
    const structured = categories['Structured'] || 0;
    const flexible = categories['Flexible'] || 0;

    if (independent > teamwork && structured > flexible) {
      return 'Independent & Structured';
    } else if (independent > teamwork && flexible > structured) {
      return 'Independent & Flexible';
    } else if (teamwork > independent && structured > flexible) {
      return 'Collaborative & Structured';
    } else {
      return 'Collaborative & Flexible';
    }
  };

  return {
    navigationSteps,
    academicResults,
    personalityResponses,
    personalityProfile,
    qualifyingDegrees,
    updateStepCompletion,
    saveAcademicResults,
    savePersonalityResponses,
    setQualifyingDegrees
  };
};