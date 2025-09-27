import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Target, TrendingUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { useCareerGuidanceContext } from '@/contexts/CareerGuidanceContext';
import { ChatMessage } from '@/types/career';

const SUGGESTED_QUESTIONS = [
  "What career paths match my personality?",
  "How can I improve my chances for medicine?",
  "What are the job prospects for computer science?",
  "Should I consider a gap year?",
  "What subjects should I focus on improving?",
  "Tell me about university application deadlines"
];

const QUICK_ACTIONS = [
  {
    icon: BookOpen,
    title: "Explore Career Paths",
    description: "Get detailed information about careers that match your profile",
    prompt: "Tell me about career paths that match my personality and academic results"
  },
  {
    icon: Target,
    title: "Compare Degrees",
    description: "Compare different degree programs side by side",
    prompt: "Can you help me compare different degree options based on my interests?"
  },
  {
    icon: TrendingUp,
    title: "Study Planning",
    description: "Get personalized study plans and improvement strategies",
    prompt: "Create a study plan to help me improve my academic performance"
  },
  {
    icon: Sparkles,
    title: "Subject Improvement",
    description: "Get specific advice for improving in challenging subjects",
    prompt: "What are the best ways to improve my marks in my weakest subjects?"
  }
];

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { personalityProfile, academicResults } = useCareerGuidanceContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: `Hello! I'm your personal career guidance assistant. I've analyzed your academic results and personality profile, and I'm here to help you make informed decisions about your future. What would you like to know?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('career') || lowerMessage.includes('path')) {
      return `Based on your personality profile, I can see you have strong analytical and problem-solving skills. Your top career matches include:

• **STEM Fields**: Your logical thinking and curiosity make you well-suited for careers in science, technology, engineering, and mathematics
• **Research & Academia**: Your love for exploring new concepts suggests you'd thrive in research environments
• **Technology & Innovation**: Your experimental nature and tech interest align with software development and innovation roles

Your academic results show particular strength in ${academicResults[0]?.subject || 'mathematics'} (${academicResults[0]?.mark || 78}%), which opens doors to quantitative careers.

Would you like me to elaborate on any specific field?`;
    }

    if (lowerMessage.includes('improve') || lowerMessage.includes('study')) {
      const weakestSubject = academicResults.reduce((min: { mark: number; }, subject: { mark: number; }) =>
        subject.mark < min.mark ? subject : min, academicResults[0] || { subject: 'Physical Sciences', mark: 65 }
      );

      return `I notice your ${weakestSubject.subject} mark is ${weakestSubject.mark}%. Here's a targeted improvement plan:

**Immediate Actions (Next 4 weeks):**
• Schedule 3 study sessions per week focusing on problem areas
• Complete past exam papers under timed conditions
• Identify and fill knowledge gaps systematically

**Study Techniques:**
• Use active recall instead of just re-reading
• Create concept maps for complex topics  
• Form study groups for peer learning
• Seek help from teachers during consultation hours

**Resources:**
• Online tutorials (Khan Academy, Coursera)
• Textbook practice problems
• Past examination papers
• Tutoring services if budget allows

With consistent effort, a 10-15% improvement is realistic within 6 months. Would you like specific resources for ${weakestSubject.subject}?`;
    }

    if (lowerMessage.includes('medicine') || lowerMessage.includes('doctor')) {
      return `Medicine is a competitive field requiring strong academic performance and specific personal qualities. Here's what you need to know:

**Academic Requirements:**
• Mathematics: 80%+ (you have ${academicResults.find((r: { subject: string; }) => r.subject === 'Mathematics')?.mark || 'N/A'}%)
• Physical Sciences: 75%+  
• Life Sciences: 80%+
• English: 70%+

**Your Suitability:**
Based on your personality profile, you show traits that align with healthcare careers:
• Strong helping motivation
• Good emotional stability under pressure
• Detail-oriented approach

**Improvement Strategy:**
Focus intensively on Life Sciences and Physical Sciences if these are below requirements. Consider a gap year for intensive preparation if needed.

**Alternative Pathways:**
• Biomedical Science (easier entry, can transfer)
• Health Sciences programs
• Medical Technology degrees

Would you like specific study strategies for the science subjects?`;
    }

    if (lowerMessage.includes('computer science') || lowerMessage.includes('programming')) {
      return `Computer Science is an excellent match for your profile! Here's why and what to expect:

**Why It Fits You:**
• Your analytical and logical thinking style
• Problem-solving preferences align with programming
• Mathematics strength (${academicResults.find((r: { subject: string; }) => r.subject === 'Mathematics')?.mark || 'N/A'}%) is crucial for CS

**Job Market Outlook:**
• High demand across all industries
• Excellent salary prospects (R300k-R800k+ starting)
• Remote work opportunities
• Continuous learning and innovation

**Career Specializations:**
• Software Development
• Data Science & AI
• Cybersecurity
• Mobile App Development
• Game Development

**University Requirements:**
Most programs need Mathematics 70%+ and English 60%+. Your current performance looks promising!

**Skills to Develop Now:**
• Start learning Python or JavaScript
• Practice logical problem-solving
• Explore online coding platforms

Want specific university recommendations or coding resources to get started?`;
    }

    // Default response
    return `That's a great question! Based on your unique profile combining ${personalityProfile?.strengths.slice(0, 2).join(' and ')} strengths with your academic performance, I can provide personalized guidance.

Your academic results show particular promise in areas requiring ${personalityProfile?.workStyle.toLowerCase() || 'analytical thinking'}. This opens up several interesting pathways.

Could you be more specific about what aspect of career planning you'd like to explore? I can help with:
• Specific degree comparisons
• University application strategies  
• Subject improvement plans
• Career progression planning
• Gap year considerations

What interests you most?`;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(content);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try asking your question again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
        ? 'bg-primary text-white'
        : 'gradient-primary text-white'
        }`}>
        {message.sender === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.sender === 'user'
        ? 'bg-primary text-primary-foreground ml-auto'
        : 'bg-muted/50 border'
        }`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TypingAnimation

            className="text-2xl font-bold text-gradient mb-4"
          >Your Personal Career Guidance Assistant</TypingAnimation>
          <p className="text-muted-foreground text-lg">
            Get personalized advice about your career journey based on your unique profile.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Career Guidance Chat
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <MessageBubble key={message.id} message={message} />
                    ))}

                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted/50 border rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about degrees, careers, or next steps..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || isTyping}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {QUICK_ACTIONS.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full p-3 h-auto justify-start text-left hover:bg-primary/5"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Profile Summary */}
            {personalityProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Top Strengths</h4>
                    <div className="flex flex-wrap gap-1">
                      {personalityProfile.strengths.slice(0, 3).map((strength: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Work Style</h4>
                    <p className="text-xs text-muted-foreground">
                      {personalityProfile.workStyle}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Academic Results</h4>
                    <div className="space-y-1">
                      {academicResults.slice(0, 3).map((result: { subject: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; mark: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{result.subject}</span>
                          <span className="font-medium">{result.mark}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}