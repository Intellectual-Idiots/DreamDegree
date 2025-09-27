import React, { useState } from 'react';
import { Upload, Plus, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorderBeam } from '@/components/ui/border-beam';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { AcademicResult } from '@/types/career';
import { useCareerGuidance } from '@/hooks/useCareerGuidance';
import { useToast } from '@/hooks/use-toast';

const SUBJECTS = [
  'Mathematics',
  'English',
  'Physical Sciences',
  'Life Sciences',
  'Geography',
  'History',
  'Economics',
  'Accounting',
  'Business Studies',
  'Information Technology',
  'Computer Application Technology',
  'Agricultural Sciences',
  'Tourism',
  'Consumer Studies',
  'Visual Arts',
  'Music',
  'Dramatic Arts',
  'Dance Studies',
  'Design',
  'Civil Technology',
  'Electrical Technology',
  'Mechanical Technology',
  'Engineering Graphics & Design'
];

export default function Page() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualResults, setManualResults] = useState<AcademicResult[]>([
    { subject: '', mark: 0 }
  ]);
  const [extractedResults, setExtractedResults] = useState<AcademicResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const { saveAcademicResults, academicResults } = useCareerGuidance();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Simulate document parsing and mark extraction
    setTimeout(() => {
      const mockResults: AcademicResult[] = [
        { subject: 'Mathematics', mark: 78 },
        { subject: 'English', mark: 65 },
        { subject: 'Physical Sciences', mark: 82 },
        { subject: 'Life Sciences', mark: 74 },
        { subject: 'Geography', mark: 68 }
      ];
      setExtractedResults(mockResults);
    }, 2000);
    
    toast({
      title: "Document uploaded successfully",
      description: "Extracting marks from your document...",
    });
  };

  const addManualSubject = () => {
    setManualResults([...manualResults, { subject: '', mark: 0 }]);
  };

  const removeManualSubject = (index: number) => {
    const newResults = manualResults.filter((_, i) => i !== index);
    setManualResults(newResults);
  };

  const updateManualResult = (index: number, field: keyof AcademicResult, value: string | number) => {
    const newResults = [...manualResults];
    newResults[index] = { ...newResults[index], [field]: value };
    setManualResults(newResults);
  };

  const saveManualResults = () => {
    const validResults = manualResults.filter(r => r.subject && r.mark > 0);
    if (validResults.length === 0) {
      toast({
        title: "No valid results",
        description: "Please add at least one subject with a mark.",
        variant: "destructive"
      });
      return;
    }
    
    saveAcademicResults(validResults);
    setShowManualModal(false);
    toast({
      title: "Results saved successfully",
      description: `Added ${validResults.length} subjects to your profile.`,
    });
  };

  const confirmExtractedResults = () => {
    saveAcademicResults(extractedResults);
    setShowUploadModal(false);
    setExtractedResults([]);
    toast({
      title: "Results confirmed",
      description: "Your academic results have been saved.",
    });
  };

  const hasResults = academicResults.length > 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <TypingAnimation 
              text="Let's start by understanding your academic performance"
              className="text-2xl font-bold text-gradient"
            />
          </div>
          <p className="text-muted-foreground text-lg">
            Upload your academic results or enter them manually to begin your career discovery journey.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span>Step 1 of 2 - Academic Results</span>
          </div>
        </div>

        {/* Results Summary */}
        {hasResults && (
          <Card className="mb-8 border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <FileText className="h-5 w-5" />
                Your Academic Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {academicResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <span className="font-medium">{result.subject}</span>
                    <span className="text-lg font-bold text-primary">{result.mark}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Upload Report Card */}
          <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
            <DialogTrigger asChild>
              <Card className="career-card cursor-pointer group">
                <BorderBeam>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Upload Report</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Upload your academic transcript or report card and we'll extract your marks automatically.
                    </p>
                    <Button className="w-full gradient-primary text-white border-0 hover:opacity-90">
                      Choose File to Upload
                    </Button>
                  </CardContent>
                </BorderBeam>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Academic Report</DialogTitle>
              </DialogHeader>
              
              {extractedResults.length === 0 ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Drag and drop your report here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Supports PDF, JPG, PNG files up to 10MB
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-4">Extracted Results</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {extractedResults.map((result, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">{result.subject}</span>
                        <span className="text-lg font-bold">{result.mark}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button onClick={confirmExtractedResults} className="flex-1">
                      Confirm Results
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setExtractedResults([])}
                      className="flex-1"
                    >
                      Re-upload
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Manual Entry Card */}
          <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
            <DialogTrigger asChild>
              <Card className="career-card cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Manually Enter Marks</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Enter your marks for each subject manually for complete control over your data.
                  </p>
                  <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-white">
                    Enter Marks
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Enter Your Marks</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto space-y-4">
                {manualResults.map((result, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`subject-${index}`}>Subject</Label>
                      <Select 
                        value={result.subject} 
                        onValueChange={(value) => updateManualResult(index, 'subject', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(subject => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-24">
                      <Label htmlFor={`mark-${index}`}>Mark (%)</Label>
                      <Input
                        id={`mark-${index}`}
                        type="number"
                        min="0"
                        max="100"
                        value={result.mark || ''}
                        onChange={(e) => updateManualResult(index, 'mark', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    {manualResults.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeManualSubject(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addManualSubject}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={saveManualResults} className="w-full">
                  Save Results
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Next Step Button */}
        {hasResults && (
          <div className="text-center">
            <Button
              size="lg"
              className="px-8 py-3 text-lg gradient-primary text-white border-0 hover:opacity-90"
              onClick={() => window.location.href = '/personality-quiz'}
            >
              Continue to Personality Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}