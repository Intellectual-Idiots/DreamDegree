'use client';

import { useState, useEffect } from 'react';

// Define interfaces for the gap analysis data
interface GapDegree {
  title: string;
  description: string;
  faculty: string;
  duration: number;
  university: string;
  aps: number;
  mathematics?: number;
  "english home language"?: number;
  "english first additional language"?: number;
  careers: string[];
  "additional requirements": string[];
  gap_type: "almost_qualified" | "personality_match" | "exposure";
  gap_reasons: string[];
  recommended_actions: RecommendedAction[];
  personality_match_score?: number; // 1-100 for personality matches
  missing_points?: number; // For almost qualified degrees
}

interface RecommendedAction {
  action: string;
  description: string;
  timeline: string;
  difficulty: "easy" | "moderate" | "challenging";
  success_rate?: string;
}

const GapAnalysisPage = () => {
  const [gapDegrees, setGapDegrees] = useState<GapDegree[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load gap analysis data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/gap-analysis.json');
        const data: GapDegree[] = await response.json();
        setGapDegrees(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load gap analysis data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter degrees by category
  const filteredDegrees = selectedCategory === 'all'
    ? gapDegrees
    : gapDegrees.filter(degree => degree.gap_type === selectedCategory);

  // Get category display names and counts
  const categoryInfo = {
    all: { name: 'All Opportunities', count: gapDegrees.length },
    almost_qualified: {
      name: 'Almost Qualified',
      count: gapDegrees.filter(d => d.gap_type === 'almost_qualified').length
    },
    personality_match: {
      name: 'Personality Matches',
      count: gapDegrees.filter(d => d.gap_type === 'personality_match').length
    },
    exposure: {
      name: 'Hidden Gems',
      count: gapDegrees.filter(d => d.gap_type === 'exposure').length
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'challenging': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-[var(--color-text-subtle)] bg-[var(--color-surface-muted)] border-[var(--color-border)]';
    }
  };

  // Get gap type color and icon
  const getGapTypeInfo = (gapType: string) => {
    switch (gapType) {
      case 'almost_qualified':
        return {
          color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
          icon: '📊',
          title: 'Almost Qualified'
        };
      case 'personality_match':
        return {
          color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
          icon: '🎯',
          title: 'Great Personality Match'
        };
      case 'exposure':
        return {
          color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
          icon: '💎',
          title: 'Hidden Opportunity'
        };
      default:
        return {
          color: 'text-[var(--color-text-subtle)] bg-[var(--color-surface-muted)] border-[var(--color-border)]',
          icon: '📋',
          title: 'Opportunity'
        };
    }
  };

  // Gap Analysis Card Component
  const GapAnalysisCard = ({ degree }: { degree: GapDegree }) => {
    const gapInfo = getGapTypeInfo(degree.gap_type);

    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-primary)] transition-all duration-300">
        {/* Header with gap type indicator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${gapInfo.color}`}>
                {gapInfo.icon} {gapInfo.title}
              </span>
              {degree.personality_match_score && (
                <span className="px-2 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded text-xs font-medium">
                  {degree.personality_match_score}% Match
                </span>
              )}
              {degree.missing_points && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  -{degree.missing_points} APS points
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
          </div>
        </div>

        <p className="text-[var(--color-text)] mb-4 leading-relaxed">{degree.description}</p>

        {/* Gap Reasons */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Why you don't currently qualify:</h4>
          <ul className="list-disc list-inside text-sm text-[var(--color-text-subtle)] space-y-1">
            {degree.gap_reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-[var(--color-text)] mb-2">Requirements:</h4>
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
          </div>
        </div>

        {/* Career Opportunities */}
        <div className="mb-6">
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

        {/* Recommended Actions */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Recommended Action Plan:</h4>
          <div className="space-y-3">
            {degree.recommended_actions.map((action, index) => (
              <div key={index} className="bg-[var(--color-surface-muted)] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-[var(--color-text)]">{action.action}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(action.difficulty)}`}>
                      {action.difficulty}
                    </span>
                    {action.success_rate && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {action.success_rate} success
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-subtle)] mb-2">{action.description}</p>
                <p className="text-xs text-[var(--color-text-subtle)]">
                  <span className="font-medium">Timeline:</span> {action.timeline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text)] text-lg">Loading gap analysis...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Gap Analysis</h1>
          <p className="text-[var(--color-text-subtle)] text-lg">
            Degrees you could qualify for with some additional effort, and opportunities you might not have considered.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${selectedCategory === key
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
                  }`}
              >
                {info.name}
                <span className={`px-2 py-1 rounded text-xs ${selectedCategory === key
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-border)] text-[var(--color-text-subtle)]'
                  }`}>
                  {info.count}
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
                Showing {filteredDegrees.length} opportunities in {categoryInfo[selectedCategory as keyof typeof categoryInfo].name.toLowerCase()}
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
              No opportunities in this category
            </h3>
            <p className="text-[var(--color-text-subtle)]">
              Try exploring other categories to find degrees that might be a good fit for you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysisPage;