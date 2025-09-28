'use client';

import { useState, useEffect } from 'react';

// Define the degree interface
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
  careers: string[];
  "additional requirements": string[];
}

// Extended interface for recommended degrees
interface RecommendedDegree extends Degree {
  recommendation_reason: string;
}

const QualifyingDegreesPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [allDegrees, setAllDegrees] = useState<Degree[]>([]);
  const [recommendedDegrees, setRecommendedDegrees] = useState<RecommendedDegree[]>([]);
  const [personalityText, setPersonalityText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Filters for "All Degrees" view
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');

  // Load data from files
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all degrees
        const allDegreesResponse = await fetch('/qualified-degrees.json');
        const allDegreesData: Degree[] = await allDegreesResponse.json();
        setAllDegrees(allDegreesData);

        // Load recommended degrees
        const recommendedDegreesResponse = await fetch('/recommended-degrees.json');
        const recommendedDegreesData: RecommendedDegree[] = await recommendedDegreesResponse.json();
        setRecommendedDegrees(recommendedDegreesData);

        // Load personality text
        const personalityResponse = await fetch('/personality-summary.txt');
        const personalityData = await personalityResponse.text();
        setPersonalityText(personalityData);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique universities and faculties for filters
  const universities = [...new Set(allDegrees.map(degree => degree.university))];
  const faculties = [...new Set(allDegrees.map(degree => degree.faculty))];

  // Filter degrees based on selected filters
  const filteredDegrees = allDegrees.filter(degree => {
    const universityMatch = selectedUniversity === 'all' || degree.university === selectedUniversity;
    const facultyMatch = selectedFaculty === 'all' || degree.faculty === selectedFaculty;
    return universityMatch && facultyMatch;
  });

  // Degree card component
  const DegreeCard = ({ degree, isRecommended = false }: { degree: Degree | RecommendedDegree; isRecommended?: boolean }) => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
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
        {degree["additional requirements"].length > 0 && (
          <div className="mt-2">
            <span className="text-[var(--color-text-subtle)] text-sm">Additional: </span>
            <span className="text-[var(--color-text)] text-sm">{degree["additional requirements"].join(", ")}</span>
          </div>
        )}
      </div>

      {/* Careers */}
      <div className="mb-4">
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

      {/* Recommendation reason (only for recommended degrees) */}
      {isRecommended && 'recommendation_reason' in degree && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <h4 className="text-sm font-medium text-[var(--color-primary)] mb-2">Why this degree is recommended for you:</h4>
          <p className="text-[var(--color-text)] text-sm leading-relaxed">{degree.recommendation_reason}</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text)] text-lg">Loading qualifying degrees...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6">Qualifying Degrees</h1>

          {/* Tab Navigation */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
                }`}
            >
              All Degrees
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'recommended'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
                }`}
            >
              Recommended Degrees
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'all' ? (
          <>
            {/* Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">University</label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="all">All Universities</option>
                    {universities.map(university => (
                      <option key={university} value={university}>{university}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Faculty</label>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="all">All Faculties</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-[var(--color-text-subtle)]">
                Showing {filteredDegrees.length} degrees that you qualify for
              </p>
            </div>

            {/* Degrees Grid */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {filteredDegrees.map((degree, index) => (
                <DegreeCard key={index} degree={degree} />
              ))}
            </div>

            {filteredDegrees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[var(--color-text-subtle)] text-lg">No degrees match your current filters.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Personality Summary */}
            <div className="mb-8">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Your Personality & Career Match</h2>
                <div className="text-[var(--color-text)] leading-relaxed whitespace-pre-line">
                  {personalityText}
                </div>
              </div>
            </div>

            {/* Top 5 Recommended Degrees */}
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">
                Top 5 Recommended Degrees for You
              </h2>
              <p className="text-[var(--color-text-subtle)] mb-8">
                These degrees are specially selected based on your personality assessment and academic qualifications.
              </p>

              <div className="space-y-6">
                {recommendedDegrees.slice(0, 5).map((degree, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-4 top-6 w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <DegreeCard degree={degree} isRecommended={true} />
                  </div>
                ))}
              </div>

              {recommendedDegrees.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[var(--color-text-subtle)] text-lg">No recommended degrees available at this time.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QualifyingDegreesPage;