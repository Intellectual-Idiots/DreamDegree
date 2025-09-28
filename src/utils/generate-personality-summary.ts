// src/utils/generate-personality-summary.ts

interface Question {
  id: number;
  question: string;
  category: string;
  career_paths: string[];
}

interface QuizData {
  questions: Question[];
  answers: { [questionId: number]: number };
  timestamp: string;
}

export interface PersonalitySummary {
  personality_summary: string;
  work_style: string;
  top_interests: string[];
  learning_preference: string;
}

export function generatePersonalitySummary(): PersonalitySummary | null {
  // Get quiz data from localStorage
  const storedData = localStorage.getItem('quiz_data');
  if (!storedData) {
    console.error('No quiz data found in localStorage');
    return null;
  }

  const quizData: QuizData = JSON.parse(storedData);
  const { questions, answers } = quizData;

  // Calculate category scores (average of answers for each category)
  const categoryScores: { [category: string]: number[] } = {};

  questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = [];
      }
      categoryScores[question.category].push(answer);
    }
  });

  // Convert to averages (1-5 scale)
  const categoryAverages: { [category: string]: number } = {};
  Object.entries(categoryScores).forEach(([category, scores]) => {
    categoryAverages[category] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Get high-scoring categories (4+ average)
  const strongCategories = Object.entries(categoryAverages)
    .filter(([_, score]) => score >= 4)
    .sort(([_, a], [__, b]) => b - a)
    .map(([category]) => category);

  // Get top career paths from high-scoring questions
  const careerPathCounts: { [path: string]: number } = {};
  questions.forEach(question => {
    const answer = answers[question.id];
    if (answer && answer >= 4) { // High agreement
      question.career_paths.forEach(path => {
        careerPathCounts[path] = (careerPathCounts[path] || 0) + 1;
      });
    }
  });

  const topCareerPaths = Object.entries(careerPathCounts)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 2)
    .map(([path]) => path);

  // Generate personality summary
  let personalityTraits: string[] = [];
  let workStyle: string[] = [];
  let interests: string[] = [];
  let learningPref = "balanced learning approach";

  // Map categories to traits
  strongCategories.forEach(category => {
    switch (category.toLowerCase()) {
      case 'extraversion':
        personalityTraits.push('extraversion');
        break;
      case 'conscientiousness':
        personalityTraits.push('conscientiousness');
        break;
      case 'openness':
        personalityTraits.push('openness');
        break;
      case 'agreeableness':
        personalityTraits.push('agreeableness');
        break;
      case 'emotional stability':
        personalityTraits.push('emotional stability');
        break;
      case 'independent':
        workStyle.push('independent');
        break;
      case 'teamwork':
        workStyle.push('collaborative');
        break;
      case 'structured':
        workStyle.push('structured');
        break;
      case 'achievement':
        workStyle.push('achievement-oriented');
        break;
      case 'helping':
      case 'helping/others':
        workStyle.push('people-focused');
        interests.push('helping people');
        break;
      case 'tech':
        interests.push('technology');
        break;
      case 'numbers/analytical':
        interests.push('mathematics');
        break;
      case 'creativity':
        interests.push('creativity');
        break;
      case 'business interest':
        interests.push('business');
        break;
      case 'physical':
        interests.push('physical activities');
        break;
      case 'practical learner':
        learningPref = "hands-on, practical learning";
        break;
      case 'theoretical learner':
        learningPref = "theoretical, conceptual learning";
        break;
    }
  });

  // Build personality summary string
  const personalityText = personalityTraits.length > 0
    ? `High ${personalityTraits.slice(0, 2).join(' and ')}.`
    : 'Well-balanced personality.';

  const workText = workStyle.includes('independent')
    ? 'Prefers independent work'
    : workStyle.includes('collaborative')
      ? 'Enjoys collaborative work'
      : 'Adaptable work approach';

  const environmentText = workStyle.includes('structured')
    ? 'in structured environments'
    : 'in flexible environments';

  const motivationText = workStyle.includes('achievement-oriented')
    ? 'Motivated by personal achievement.'
    : workStyle.includes('people-focused')
      ? 'Motivated by helping others.'
      : 'Driven by meaningful work.';

  const interestText = interests.length > 0
    ? `Strong interests in ${interests.slice(0, 3).join(', ')}.`
    : 'Diverse range of interests.';

  const careerText = topCareerPaths.length > 0
    ? `Top career matches: ${topCareerPaths.join(', ')}.`
    : '';

  const personalitySummary = `${personalityText} ${workText} ${environmentText}. ${motivationText} ${interestText} ${careerText}`.trim();

  // Final summary object
  const summary: PersonalitySummary = {
    personality_summary: personalitySummary,
    work_style: workStyle.length > 0 ? workStyle.join(', ') : 'adaptable',
    top_interests: interests.length > 0 ? interests.slice(0, 3) : ['varied interests'],
    learning_preference: learningPref
  };

  // Save summary to localStorage and create/update JSON file
  localStorage.setItem('personality_summary', JSON.stringify(summary));

  // Log for debugging
  console.log('Generated Personality Summary:', summary);

  return summary;
}

// Helper function to get existing summary from localStorage
export function getPersonalitySummary(): PersonalitySummary | null {
  const stored = localStorage.getItem('personality_summary');
  return stored ? JSON.parse(stored) : null;
}

// Function to create/update the personality summary JSON file
export function savePersonalitySummaryToFile(): void {
  const summary = getPersonalitySummary();
  if (summary) {
    // In a real app, you'd save this to a file or send to backend
    // For now, we'll just make it available in localStorage
    console.log('Personality Summary JSON:');
    console.log(JSON.stringify(summary, null, 2));

    // You could also trigger a download of the JSON file:
    // const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'personality-summary.json';
    // a.click();
  }
}
