import React, { useState, useEffect } from 'react';
import { Search, Filter, University, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorderBeam } from '@/components/ui/border-beam';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { useCareerGuidanceContext } from '@/contexts/CareerGuidanceContext';
import { Degree } from '@/types/career';

// Mock degree data
const MOCK_DEGREES: Degree[] = [
  {
    id: '1',
    name: 'Computer Science',
    university: 'University of Cape Town',
    faculty: 'Science',
    duration: '3 years',
    requirements: { minAPS: 40, subjects: { Mathematics: 70, English: 60, 'Physical Sciences': 65 } },
    description: 'Comprehensive program covering software development, algorithms, and computer systems.',
    careerProspects: ['Software Developer', 'Data Scientist', 'Systems Analyst'],
    personalityMatch: 92
  },
  {
    id: '2',
    name: 'Mechanical Engineering',
    university: 'University of the Witwatersrand',
    faculty: 'Engineering',
    duration: '4 years',
    requirements: { minAPS: 42, subjects: { Mathematics: 75, 'Physical Sciences': 70, English: 60 } },
    description: 'Design and manufacture of mechanical systems and machines.',
    careerProspects: ['Mechanical Engineer', 'Product Designer', 'Manufacturing Engineer'],
    personalityMatch: 88
  },
  {
    id: '3',
    name: 'Business Administration',
    university: 'Stellenbosch University',
    faculty: 'Business',
    duration: '3 years',
    requirements: { minAPS: 38, subjects: { Mathematics: 60, English: 65, Economics: 60 } },
    description: 'Comprehensive business education covering management, finance, and strategy.',
    careerProspects: ['Business Manager', 'Consultant', 'Entrepreneur'],
    personalityMatch: 85
  },
  {
    id: '4',
    name: 'Medicine',
    university: 'University of Cape Town',
    faculty: 'Health Sciences',
    duration: '6 years',
    requirements: { minAPS: 45, subjects: { Mathematics: 80, 'Life Sciences': 80, 'Physical Sciences': 75, English: 70 } },
    description: 'Comprehensive medical education preparing students for healthcare careers.',
    careerProspects: ['Medical Doctor', 'Specialist', 'Researcher'],
    personalityMatch: 79
  },
  {
    id: '5',
    name: 'Psychology',
    university: 'University of Pretoria',
    faculty: 'Humanities',
    duration: '4 years',
    requirements: { minAPS: 35, subjects: { English: 65, Mathematics: 50 } },
    description: 'Study of human behavior and mental processes.',
    careerProspects: ['Clinical Psychologist', 'Counselor', 'Researcher'],
    personalityMatch: 82
  }
];

const UNIVERSITIES = ['All Universities', 'University of Cape Town', 'University of the Witwatersrand', 'Stellenbosch University', 'University of Pretoria'];
const FACULTIES = ['All Faculties', 'Science', 'Engineering', 'Business', 'Health Sciences', 'Humanities'];

export default function Page() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All Universities');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>(MOCK_DEGREES);
  
  const { personalityProfile, academicResults } = useCareerGuidanceContext();

  useEffect(() => {
    let filtered = MOCK_DEGREES;
    
    // Apply filters
    if (searchQuery) {
      filtered = filtered.filter(degree => 
        degree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        degree.university.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedUniversity !== 'All Universities') {
      filtered = filtered.filter(degree => degree.university === selectedUniversity);
    }
    
    if (selectedFaculty !== 'All Faculties') {
      filtered = filtered.filter(degree => degree.faculty === selectedFaculty);
    }
    
    // Sort by personality match for recommended tab
    if (activeTab === 'recommended') {
      filtered = filtered
        .filter(degree => degree.personalityMatch && degree.personalityMatch > 70)
        .sort((a, b) => (b.personalityMatch || 0) - (a.personalityMatch || 0))
        .slice(0, 5);
    }
    
    setFilteredDegrees(filtered);
  }, [searchQuery, selectedUniversity, selectedFaculty, activeTab]);

  const checkQualification = (degree: Degree): boolean => {
    if (!academicResults.length) return true;
    
    // Check if student meets minimum requirements
    for (const [subject, minMark] of Object.entries(degree.requirements.subjects)) {
      const studentMark = academicResults.find((r: { subject: string; }) => r.subject === subject)?.mark || 0;
      if (studentMark < minMark) return false;
    }
    
    return true;
  };

  const DegreeCard: React.FC<{ degree: Degree; isRecommended?: boolean; rank?: number }> = ({ 
    degree, 
    isRecommended = false, 
    rank 
  }) => {
    const isQualified = checkQualification(degree);
    
    return (
      <Card className="career-card group cursor-pointer">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {isRecommended && rank && (
                  <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-primary/20">
                    #{rank} Match
                  </Badge>
                )}
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {degree.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{degree.university}</p>
              </div>
              {isRecommended && degree.personalityMatch && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-warning fill-current" />
                  <span className="font-semibold">{degree.personalityMatch}%</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <University className="h-4 w-4 text-muted-foreground" />
                <span>{degree.faculty}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{degree.duration}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {degree.description}
            </p>
            
            <div>
              <p className="text-xs font-medium mb-2">Career Prospects:</p>
              <div className="flex flex-wrap gap-1">
                {degree.careerProspects.slice(0, 3).map((career, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isQualified ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-xs text-muted-foreground">
                  {isQualified ? 'Qualified' : 'Requirements not met'}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                <span className="text-xs">View Details</span>
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
          <BorderBeam duration={8} size={100} />
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TypingAnimation 
            className="text-2xl font-bold text-gradient mb-4"
          >
            Your Qualifying University Degrees
          </TypingAnimation>
          <p className="text-muted-foreground text-lg">
            Discover university programs that match your academic performance and personality.
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              All Degrees
            </TabsTrigger>
            <TabsTrigger value="recommended" className="data-[state=active]:gradient-accent data-[state=active]:text-white">
              Recommended for You
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search degrees or universities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map(uni => (
                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {FACULTIES.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Degrees Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDegrees.map(degree => (
                <DegreeCard key={degree.id} degree={degree} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-6">
            {/* Personality Summary */}
            {personalityProfile && (
              <Card className="gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-gradient">Your Personality Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Top Strengths:</h4>
                      <div className="space-y-1">
                        {personalityProfile.strengths.map((strength: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                          <Badge key={index} variant="secondary" className="mr-1 mb-1">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Work Style:</h4>
                      <p className="text-muted-foreground">{personalityProfile.workStyle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Degrees */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Top 5 Recommended Degrees</h3>
              <div className="space-y-4">
                {filteredDegrees.map((degree, index) => (
                  <DegreeCard 
                    key={degree.id} 
                    degree={degree} 
                    isRecommended={true}
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Next Step */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="px-8 py-3 text-lg gradient-primary text-white border-0 hover:opacity-90"
            onClick={() => window.location.href = '/gap-analysis'}
          >
            Continue to Gap Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}