// src/utils/generate-gap-analysis.ts

import { get_ufs_aps, get_up_aps, get_wits_aps } from "./aps-calculator";

import { get_almost_qualified_degrees } from '@/utils/touch';


interface Degree {
  title: string;
  description: string;
  faculty: string;
  duration: number;
  university: string;
  aps: number;
  mathematics?: number;
  "english home language"?: number;
  "english first additional language"?: number;
  "physical sciences"?: number;
  "life sciences"?: number;
  careers: string[];
  "additional requirements": string[];
}

interface EnhancedDegree extends Degree {
  aps_gap: number;
  subject_gaps: { [subject: string]: number };
  total_gaps: number;
  qualification_score: number;
  difficulty_level: "easy" | "moderate" | "challenging";
}

interface StudentMark {
  subject: string;
  mark: number;
}

// Hardcoded student data
// const STUDENT_MARKS: StudentMark[] = [
//   { "subject": "english home language", "mark": 65 },
//   { "subject": "afrikaans first additional language", "mark": 91 },
//   { "subject": "mathematics", "mark": 87 },
//   { "subject": "life orientation", "mark": 86 },
//   { "subject": "geography", "mark": 71 },
//   { "subject": "life sciences", "mark": 76 },
//   { "subject": "physical sciences", "mark": 88 }
// ];

function getStudentMarks(): StudentMark[] {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return JSON.parse(localStorage.getItem("resultsData") || "[]");
    } catch {
      return [];
    }
  }
  return []; // fallback for server
}

const STUDENT_MARKS: StudentMark[] = getStudentMarks();


// Hardcoded APS scores
const UP_APS = get_up_aps();
const WITS_APS = get_wits_aps();
const UFS_APS = get_ufs_aps();

function getStudentAPS(university: string): number {
  switch (university.toLowerCase()) {
    case 'university of pretoria':
      return UP_APS;
    case 'university of the witwatersrand':
      return WITS_APS;
    case 'university of the free state':
      return UFS_APS;
    default:
      return WITS_APS; // default fallback
  }
}

function getStudentMark(subject: string): number {
  const mark = STUDENT_MARKS.find(m => m.subject.toLowerCase() === subject.toLowerCase());
  return mark ? mark.mark : 0;
}

function calculateGapAnalysis(degree: Degree): EnhancedDegree {
  const studentAPS = getStudentAPS(degree.university);

  // Calculate APS gap
  const apsGap = studentAPS - degree.aps;

  // Calculate subject gaps
  const subjectGaps: { [subject: string]: number } = {};
  let totalRequirements = 1; // Count APS as 1 requirement
  let metRequirements = apsGap >= 0 ? 1 : 0; // Met APS requirement?

  // Check subject requirements
  const subjectRequirements = [
    'mathematics',
    'english home language',
    'english first additional language',
    'physical sciences',
    'life sciences'
  ];

  subjectRequirements.forEach(subject => {
    const requiredMark = degree[subject as keyof Degree] as number;
    if (requiredMark !== undefined && requiredMark > 0) {
      totalRequirements++;
      const studentMark = getStudentMark(subject);
      const gap = studentMark - requiredMark;
      subjectGaps[subject] = gap;

      if (gap >= 0) {
        metRequirements++;
      }
    }
  });

  // Calculate total gaps (number of requirements not met)
  const totalGaps = totalRequirements - metRequirements;

  // Calculate qualification score (percentage of requirements met)
  const qualificationScore = Math.round((metRequirements / totalRequirements) * 100);

  // Determine difficulty level
  let difficultyLevel: "easy" | "moderate" | "challenging";

  if (totalGaps === 0) {
    difficultyLevel = "easy";
  } else if (totalGaps === 1) {
    // Check if it's just a small gap
    const maxGap = Math.abs(Math.min(apsGap, ...Object.values(subjectGaps)));
    if (maxGap <= 5) {
      difficultyLevel = "easy";
    } else if (maxGap <= 15) {
      difficultyLevel = "moderate";
    } else {
      difficultyLevel = "challenging";
    }
  } else if (totalGaps === 2) {
    difficultyLevel = "moderate";
  } else {
    difficultyLevel = "challenging";
  }

  return {
    ...degree,
    aps_gap: apsGap,
    subject_gaps: subjectGaps,
    total_gaps: totalGaps,
    qualification_score: qualificationScore,
    difficulty_level: difficultyLevel
  };
}

// Generate gap analysis and store in localStorage
export async function generateGapAnalysisJSON(): Promise<EnhancedDegree[]> {
  try {
    // Generate almost-qualified.json

    // // Load almost qualified degrees
    // const response = await fetch('/almost-qualified-v2.json');
    // const degrees: Degree[] = await response.json();

    // ============================
    const degrees: Degree[] = await get_almost_qualified_degrees();

    console.log('Fetched almost-qualified degrees:', degrees);
    // ============================

    // Process each degree with gap analysis
    const enhancedDegrees = degrees.map(degree => calculateGapAnalysis(degree));

    // Sort by easiest to qualify for (highest qualification score, then lowest total gaps)
    const sortedDegrees = enhancedDegrees.sort((a, b) => {
      if (a.qualification_score !== b.qualification_score) {
        return b.qualification_score - a.qualification_score;
      }
      return a.total_gaps - b.total_gaps;
    });

    // Save to localStorage for the page to use
    localStorage.setItem('enhanced_gap_analysis', JSON.stringify(sortedDegrees));

    console.log('Generated Gap Analysis Data:', sortedDegrees);
    return sortedDegrees;

  } catch (error) {
    console.error('Failed to generate gap analysis:', error);
    return [];
  }
}

// Helper function to get enhanced gap analysis data
export function getGapAnalysisData(): EnhancedDegree[] | null {
  try {
    const stored = localStorage.getItem('enhanced_gap_analysis');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving gap analysis data:', error);
    return null;
  }
}

// Function to display student info for debugging
export function getStudentInfo() {
  return {
    marks: STUDENT_MARKS,
    aps_scores: {
      up: UP_APS,
      wits: WITS_APS,
      ufs: UFS_APS
    }
  };
}