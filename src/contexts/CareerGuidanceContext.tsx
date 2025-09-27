import React, { createContext, useContext } from 'react';
import { useCareerGuidance } from '@/hooks/useCareerGuidance';

const CareerGuidanceContext = createContext<ReturnType<typeof useCareerGuidance> | null>(null);

export const CareerGuidanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const careerGuidanceValue = useCareerGuidance();
  
  return (
    <CareerGuidanceContext.Provider value={careerGuidanceValue}>
      {children}
    </CareerGuidanceContext.Provider>
  );
};

export const useCareerGuidanceContext = () => {
  const context = useContext(CareerGuidanceContext);
  if (!context) {
    throw new Error('useCareerGuidanceContext must be used within CareerGuidanceProvider');
  }
  return context;
};