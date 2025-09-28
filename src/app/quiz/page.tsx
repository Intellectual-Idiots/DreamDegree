'use client';

import { generatePersonalitySummary } from '@/utils/generate-personality-summary';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the question interface
interface Question {
  id: number;
  question: string;
  category: string;
  career_paths: string[];
}

// Define section structure
interface Section {
  id: number;
  title: string;
  questions: Question[];
}

const PersonalityQuizPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load questions from JSON file
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // You'll need to put the personality-test.json file in your public folder
        const response = await fetch('/personality-test.json');
        const questionsData: Question[] = await response.json();
        setQuestions(questionsData);

        // Group questions into sections based on your app description
        const sectionData = createSections(questionsData);
        setSections(sectionData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Function to group questions into sections
  const createSections = (questionsData: Question[]): Section[] => {
    // Based on your app description, you want 5 sections with specific question counts
    // Section 1: Interests & Preferences (8 questions) - questions 1-8
    // Section 2: Work Style & Motivation (8 questions) - questions 9-16
    // Section 3: Problem-Solving & Thinking Style (6 questions) - questions 17-22
    // Section 4: Personality Traits (Big Five / MBTI style) (10 questions) - questions 23-32
    // Section 5: Learning & Study Preferences (8 questions) - questions 33-40

    return [
      {
        id: 1,
        title: "Interests & Preferences",
        questions: questionsData.slice(0, 8) // edit how many questions are in this section
      },
      {
        id: 2,
        title: "Work Style & Motivation",
        questions: questionsData.slice(8, 16)
      },
      {
        id: 3,
        title: "Problem-Solving & Thinking Style",
        questions: questionsData.slice(16, 22)
      },
      {
        id: 4,
        title: "Personality Traits",
        questions: questionsData.slice(22, 32)
      },
      {
        id: 5,
        title: "Learning & Study Preferences",
        questions: questionsData.slice(32, 40)
      }
    ];
  };

  // Handle answer selection
  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Check if current section is complete
  const isCurrentSectionComplete = () => {
    if (!sections[currentSection]) return false;

    return sections[currentSection].questions.every(
      question => answers[question.id] !== undefined
    );
  };

  // Check if all sections are complete
  const isQuizComplete = () => {
    return questions.every(question => answers[question.id] !== undefined);
  };

  // Navigate to next section
  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
    console.log('Current questions', questions);
    console.log('Current answers:', answers);
  };

  // Navigate to previous section
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Submit quiz
  const handleSubmit = () => {

    console.log('Questions: ', questions);
    console.log('Quiz answers:', answers);

    // Save questions and answers to localStorage
    const quizData = {
      questions: questions,
      answers: answers,
      timestamp: new Date().toISOString()
    };

    // Save Quiz Data
    localStorage.setItem('quiz_data', JSON.stringify(quizData));
    console.log('Quiz data saved to localStorage');

    // Generate personality summary (function stores personality_summary in localStorage)
    const summary = generatePersonalitySummary();
    console.log('Generated summary:', summary);

    // Navigate to the next page (qualifying degrees)
    router.push('/qualifying-degrees');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text)] text-lg">Loading personality quiz...</div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text)]">
      {/* Progress Indicator */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold mb-6">Personality Assessment</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300 ${index < currentSection
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : index === currentSection
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-subtle)]'
                    }`}
                >
                  {index + 1}
                </div>

                {/* Line between circles */}
                {index < sections.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all duration-300 ${index < currentSection
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Section titles */}
          <div className="flex justify-between mt-3 max-w-2xl mx-auto">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`text-xs text-center transition-colors duration-300 ${index === currentSection
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-subtle)]'
                  }`}
                style={{ width: '80px' }}
              >
                {section.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentSectionData && (
          <>
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                {currentSectionData.title}
              </h2>
              <p className="text-[var(--color-text-subtle)]">
                Section {currentSection + 1} of {sections.length} • {currentSectionData.questions.length} questions
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentSectionData.questions.map((question, questionIndex) => (
                <div
                  key={question.id}
                  className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6"
                >
                  <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">
                    {questionIndex + 1}. {question.question}
                  </h3>

                  {/* Rating Scale */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-subtle)]">Strongly Disagree</span>
                    <div className="flex space-x-2 mx-4">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAnswerChange(question.id, value)}
                          className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${answers[question.id] === value
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'border-[var(--color-border)] text-[var(--color-text-subtle)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                            }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-[var(--color-text-subtle)]">Strongly Agree</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--color-border)]">
              <button
                onClick={prevSection}
                disabled={currentSection === 0}
                className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              <div className="text-sm text-[var(--color-text-subtle)]">
                {Object.keys(answers).length} of {questions.length} questions answered
              </div>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={nextSection}
                  disabled={!isCurrentSectionComplete()}
                  className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next Section
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isQuizComplete()}
                  className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Complete Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalityQuizPage;