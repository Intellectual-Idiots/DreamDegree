import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Upload, 
  Brain, 
  GraduationCap, 
  Target, 
  MessageCircle,
  Check,
  Lock
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useCareerGuidance } from '@/hooks/useCareerGuidance';

const icons = {
  Upload,
  Brain,
  GraduationCap,
  Target,
  MessageCircle,
};

export const CareerSidebar = () => {
  const location = useLocation();
  const { navigationSteps } = useCareerGuidance();

  const getStepStatus = (step: typeof navigationSteps[0]): 'completed' | 'disabled' | 'active' | 'default' => {
    if (step.disabled) return 'disabled';
    if (step.completed) return 'completed';
    if (location.pathname === step.path || (location.pathname === '/' && step.id === 'upload-results')) return 'active';
    return 'default';
  };

  return (
    <Sidebar className="w-72 border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">CareerPath</h1>
            <p className="text-sm text-muted-foreground">Your Future Starts Here</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2">
            Career Discovery Journey
          </h2>
          <SidebarMenu className="space-y-2">
            {navigationSteps.map((step, index) => {
              const IconComponent = icons[step.icon as keyof typeof icons];
              const status = getStepStatus(step);
              
              return (
                <SidebarMenuItem key={step.id}>
                  {status === 'disabled' ? (
                    <SidebarMenuButton
                      className={cn(
                        "h-auto p-3 rounded-xl transition-all duration-200 opacity-50 cursor-not-allowed bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="progress-step disabled text-sm font-medium">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{step.title}</span>
                          <span className="text-xs text-muted-foreground">Locked</span>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-auto p-3 rounded-xl transition-all duration-200",
                        status === 'active' && "bg-primary/10 border border-primary/20 shadow-soft",
                        status === 'completed' && "bg-success/10 border border-success/20",
                        status === 'default' && "hover:bg-card/80 hover:shadow-soft"
                      )}
                    >
                      <NavLink 
                        to={step.id === 'upload-results' ? '/' : step.path}
                        className="flex items-center gap-3 w-full"
                      >
                        <div className={cn(
                          "progress-step text-sm font-medium",
                          status === 'active' && "active",
                          status === 'completed' && "completed"
                        )}>
                          {status === 'completed' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{step.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {status === 'completed' && 'Completed'}
                            {status === 'active' && 'In Progress'}
                            {status === 'default' && 'Ready'}
                          </span>
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                   )}
                 </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-sm mb-1">Ready to Discover?</h3>
            <p className="text-xs text-muted-foreground">
              Complete each step to unlock your perfect career path
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};