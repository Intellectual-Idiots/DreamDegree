'use client';

import { useState, useEffect } from 'react';
import { generateGapAnalysisJSON, getGapAnalysisData } from '@/utils/generate-gap-analysis';


// Define interfaces
interface EnhancedDegree {
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
  aps_gap: number;
  subject_gaps: { [subject: string]: number };
  total_gaps: number;
  qualification_score: number;
  difficulty_level: "easy" | "moderate" | "challenging";
}

const GapAnalysisPage = () => {
  const [degrees, setDegrees] = useState<EnhancedDegree[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load gap analysis data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get existing data first
        let data = getGapAnalysisData();

        // If no data exists, generate it
        // if (!data || data.length === 0) {
        data = await generateGapAnalysisJSON();
        // }


        setDegrees(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load gap analysis data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter degrees by difficulty
  const filteredDegrees = selectedDifficulty === 'all'
    ? degrees
    : degrees.filter(degree => degree.difficulty_level === selectedDifficulty);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'challenging': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-[var(--color-text-subtle)] bg-[var(--color-surface-muted)] border-[var(--color-border)]';
    }
  };

  // Get qualification score color
  const getQualificationColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Gap Analysis Card Component
  const GapAnalysisCard = ({ degree }: { degree: EnhancedDegree }) => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-primary)] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(degree.difficulty_level)}`}>
              {degree.difficulty_level.charAt(0).toUpperCase() + degree.difficulty_level.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${getQualificationColor(degree.qualification_score)}`}>
              {degree.qualification_score}% Qualified
            </span>
            {degree.total_gaps > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                {degree.total_gaps} gaps
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">{degree.title}</h3>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-subtle)] mb-2">
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">{degree.university}</span>
            <span>{degree.faculty}</span>
            <span>{degree.duration} years</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--color-primary)]">APS {degree.aps}</div>
          {degree.aps_gap < 0 && (
            <div className="text-sm text-red-400">Need {Math.abs(degree.aps_gap)} more</div>
          )}
        </div>
      </div>

      <p className="text-[var(--color-text)] mb-4 leading-relaxed">{degree.description}</p>

      {/* Requirements Analysis */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Requirements Analysis:</h4>
        <div className="space-y-2">
          {/* APS Requirement */}
          <div className="flex justify-between items-center text-sm">
            <span>APS Score:</span>
            <span className={degree.aps_gap >= 0 ? 'text-green-400' : 'text-red-400'}>
              Required: {degree.aps} | Gap: {degree.aps_gap >= 0 ? '+' : ''}{degree.aps_gap}
            </span>
          </div>

          {/* Subject Requirements */}
          {Object.entries(degree.subject_gaps).map(([subject, gap]) => (
            <div key={subject} className="flex justify-between items-center text-sm">
              <span className="capitalize">{subject.replace('_', ' ')}:</span>
              <span className={gap >= 0 ? 'text-green-400' : 'text-red-400'}>
                Gap: {gap >= 0 ? '+' : ''}{gap} points
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Original Requirements Display */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Full Requirements:</h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">APS: {degree.aps}+</span>
          {degree.mathematics && (
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">Mathematics: {degree.mathematics}%+</span>
          )}
          {degree["english home language"] && (
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">English HL: {degree["english home language"]}%+</span>
          )}
          {degree["english first additional language"] && (
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">English FAL: {degree["english first additional language"]}%+</span>
          )}
          {degree["physical sciences"] && (
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">Physical Sciences: {degree["physical sciences"]}%+</span>
          )}
          {degree["life sciences"] && (
            <span className="bg-[var(--color-surface-muted)] px-2 py-1 rounded">Life Sciences: {degree["life sciences"]}%+</span>
          )}
        </div>
      </div>

      {/* Career Opportunities */}
      <div>
        <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Career Opportunities:</h4>
        <div className="flex flex-wrap gap-1">
          {degree.careers.map((career, index) => (
            <span
              key={index}
              className="bg-[var(--color-primary-soft)] text-[var(--color-primary)] px-2 py-1 rounded text-sm border border-[var(--color-button-outline)]"
            >
              {career}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text)] text-lg">Loading gap analysis...</div>
      </div>
    );
  }

  // Calculate category counts
  const categoryCounts = {
    all: degrees.length,
    easy: degrees.filter(d => d.difficulty_level === 'easy').length,
    moderate: degrees.filter(d => d.difficulty_level === 'moderate').length,
    challenging: degrees.filter(d => d.difficulty_level === 'challenging').length
  };

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Gap Analysis</h1>
          <p className="text-[var(--color-text-subtle)] text-lg">
            Degrees you almost qualify for - here's what you need to bridge the gap.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Difficulty Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {Object.entries(categoryCounts).map(([difficulty, count]) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${selectedDifficulty === difficulty
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
                  }`}
              >
                {difficulty === 'all' ? 'All Degrees' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                <span className={`px-2 py-1 rounded text-xs ${selectedDifficulty === difficulty
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--color-border)] text-[var(--color-text-subtle)]'
                  }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredDegrees.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-[var(--color-text-subtle)]">
                Showing {filteredDegrees.length} degrees you almost qualify for
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-1">
              {filteredDegrees.map((degree, index) => (
                <GapAnalysisCard key={index} degree={degree} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              No degrees in this difficulty category
            </h3>
            <p className="text-[var(--color-text-subtle)]">
              Try exploring other difficulty levels to find degrees that might be a good fit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysisPage;