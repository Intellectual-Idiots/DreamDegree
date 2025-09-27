"use client";

import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BorderBeam } from '@/components/ui/border-beam';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { useCareerGuidanceContext } from '@/contexts/CareerGuidanceContext';
import { GapAnalysis as GapAnalysisType, Degree } from '@/types/career';

// Mock gap analysis data
const MOCK_GAP_ANALYSIS: GapAnalysisType[] = [
  {
    degreeId: '1',
    degreeName: 'Actuarial Science',
    university: 'University of Cape Town',
    currentMatch: 85,
    missingRequirements: [
      { subject: 'Mathematics', required: 85, current: 78 },
      { subject: 'Physical Sciences', required: 75, current: 65 }
    ],
    actionPlan: [
      'Retake Mathematics exam to achieve 85%+',
      'Consider supplementary exam for Physical Sciences',
      'Complete bridging course in advanced mathematics',
      'Apply for extended degree program as alternative'
    ],
    alternatives: [
      'Statistics (University of Stellenbosch)',
      'Financial Mathematics (University of Pretoria)',
      'Economics with Mathematics (Rhodes University)'
    ]
  },
  {
    degreeId: '2',
    degreeName: 'Medicine',
    university: 'University of the Witwatersrand',
    currentMatch: 75,
    missingRequirements: [
      { subject: 'Life Sciences', required: 80, current: 74 },
      { subject: 'Physical Sciences', required: 75, current: 65 },
      { subject: 'Mathematics', required: 80, current: 78 }
    ],
    actionPlan: [
      'Focus on improving Life Sciences by 6 marks',
      'Strengthen Physical Sciences fundamentals',
      'Consider gap year for intensive preparation',
      'Apply to multiple medical schools',
      'Explore Health Sciences as stepping stone'
    ],
    alternatives: [
      'Biomedical Science (University of Cape Town)',
      'Physiotherapy (University of Stellenbosch)',
      'Nursing (University of KwaZulu-Natal)',
      'Medical Technology (Cape Peninsula University of Technology)'
    ]
  },
  {
    degreeId: '3',
    degreeName: 'Veterinary Science',
    university: 'University of Pretoria',
    currentMatch: 90,
    missingRequirements: [
      { subject: 'Physical Sciences', required: 70, current: 65 }
    ],
    actionPlan: [
      'Improve Physical Sciences by 5 marks through tutoring',
      'Complete online chemistry refresher course',
      'Practice past exam papers consistently'
    ],
    alternatives: [
      'Animal Science (University of Stellenbosch)',
      'Zoology (University of Cape Town)',
      'Wildlife Management (University of Pretoria)'
    ]
  }
];

const PERFECT_MATCH_DEGREES: Degree[] = [
  {
    id: '4',
    name: 'Biomedical Engineering',
    university: 'University of the Witwatersrand',
    faculty: 'Engineering',
    duration: '4 years',
    requirements: { minAPS: 40, subjects: { Mathematics: 75, 'Physical Sciences': 70 } },
    description: 'Combines engineering principles with biological sciences for medical applications.',
    careerProspects: ['Biomedical Engineer', 'Medical Device Designer', 'Research Scientist'],
    personalityMatch: 95
  },
  {
    id: '5',
    name: 'Data Science',
    university: 'University of Cape Town',
    faculty: 'Science',
    duration: '3 years',
    requirements: { minAPS: 38, subjects: { Mathematics: 70, 'Physical Sciences': 65 } },
    description: 'Interdisciplinary field combining statistics, programming, and domain expertise.',
    careerProspects: ['Data Scientist', 'Machine Learning Engineer', 'Business Analyst'],
    personalityMatch: 93
  }
];

export default function Page() {
  const [selectedGap, setSelectedGap] = useState<string>('');
  const { personalityProfile } = useCareerGuidanceContext();
  const router = useRouter();

  const GapAnalysisCard: React.FC<{ gap: GapAnalysisType }> = ({ gap }) => {
    const isSelected = selectedGap === gap.degreeId;
    
    return (
      <Card className={`career-card transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-glow' : ''}`}>
        <BorderBeam>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{gap.degreeName}</CardTitle>
                <p className="text-muted-foreground text-sm">{gap.university}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-warning">{gap.currentMatch}%</div>
                <div className="text-xs text-muted-foreground">Match</div>
              </div>
            </div>
            <Progress value={gap.currentMatch} className="h-2" />
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                Missing Requirements
              </h4>
              <div className="space-y-2">
                {gap.missingRequirements.map((req, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{req.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{req.current}%</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold text-primary">{req.required}%</span>
                      <Badge variant="outline" className="text-xs">
                        +{req.required - req.current}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="action-plan" className="border-none">
                <AccordionTrigger className="text-sm font-semibold py-2">
                  View Action Plan ({gap.actionPlan.length} steps)
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {gap.actionPlan.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="alternatives" className="border-none">
                <AccordionTrigger className="text-sm font-semibold py-2">
                  Alternative Programs ({gap.alternatives.length})
                </AccordionTrigger>
                <AccordionContent className="space-y-1">
                  {gap.alternatives.map((alt, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                      {alt}
                    </Badge>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSelectedGap(isSelected ? '' : gap.degreeId)}
            >
              {isSelected ? 'Hide Details' : 'View Detailed Plan'}
            </Button>
          </CardContent>
        </BorderBeam>
      </Card>
    );
  };

  const PerfectMatchCard: React.FC<{ degree: Degree }> = ({ degree }) => (
    <Card className="career-card border-success/20 bg-success/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-success">{degree.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{degree.university}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-success">{degree.personalityMatch}%</div>
            <div className="text-xs text-muted-foreground">Perfect Match!</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{degree.description}</p>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">Why This Matches You:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>✓ Aligns with your analytical thinking style</div>
            <div>✓ Matches your problem-solving preferences</div>
            <div>✓ Suits your independent work style</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-2">Career Prospects:</h4>
          <div className="flex flex-wrap gap-1">
            {degree.careerProspects.map((career, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {career}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button className="w-full gradient-primary text-white border-0">
          Apply Now
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TypingAnimation className="text-2xl font-bold text-gradient mb-4">
            Close the Gap to Your Dream Degree
          </TypingAnimation>
          <p className="text-muted-foreground text-lg">
            See what it takes to qualify for programs you're almost ready for, plus discover perfect matches.
          </p>
        </div>

        {/* Almost There Degrees */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Almost There Degrees</h2>
              <p className="text-muted-foreground text-sm">
                Programs you can qualify for with some targeted improvement
              </p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {MOCK_GAP_ANALYSIS.map(gap => (
              <GapAnalysisCard key={gap.degreeId} gap={gap} />
            ))}
          </div>
        </div>

        {/* Perfect Fit Degrees */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-success flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Perfect Personality Matches</h2>
              <p className="text-muted-foreground text-sm">
                High-match degrees you already qualify for
              </p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {PERFECT_MATCH_DEGREES.map(degree => (
              <PerfectMatchCard key={degree.id} degree={degree} />
            ))}
          </div>
        </div>

        {/* Action Timeline */}
        <Card className="mb-8 gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              Suggested Timeline for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-white text-sm flex items-center justify-center">1</div>
                <div>
                  <h4 className="font-semibold">Next 3 Months</h4>
                  <p className="text-sm text-muted-foreground">Focus on improving weakest subjects through tutoring and practice</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-accent text-white text-sm flex items-center justify-center">2</div>
                <div>
                  <h4 className="font-semibold">Months 4-6</h4>
                  <p className="text-sm text-muted-foreground">Take supplementary exams or complete bridging courses</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-success text-white text-sm flex items-center justify-center">3</div>
                <div>
                  <h4 className="font-semibold">Month 7+</h4>
                  <p className="text-sm text-muted-foreground">Apply for university admission with improved results</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Step */}
        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-3 text-lg gradient-primary text-white border-0 hover:opacity-90"
            onClick={() => router.push('/ai-assistant')}
          >
            Get Personalized Guidance
          </Button>
        </div>
      </div>
    </div>
  );
}