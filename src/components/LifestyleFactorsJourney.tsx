import React from 'react';
import { UserProfile, LIFESTYLE_IMPACTS } from '@/utils/calculationUtils';
import { cn } from '@/lib/utils';
import LifestyleFactorCard from './LifestyleFactorCard';

interface LifestyleFactorsJourneyProps {
  profile: UserProfile;
  onChange: (updatedProfile: UserProfile) => void;
  className?: string;
  onComplete: () => void;
}

const LifestyleFactorsJourney: React.FC<LifestyleFactorsJourneyProps> = ({ 
  profile, 
  onChange,
  className,
  onComplete
}) => {
  const handleFactorChange = (factor: keyof UserProfile, value: string) => {
    const updatedProfile = {
      ...profile,
      [factor]: value
    };
    onChange(updatedProfile);
  };
  
  const getImpactValue = (factor: string, value: string) => {
    const factorKey = factor as keyof typeof LIFESTYLE_IMPACTS;
    const valueKey = value as keyof (typeof LIFESTYLE_IMPACTS)[typeof factorKey];
    
    if (LIFESTYLE_IMPACTS[factorKey]?.[valueKey] !== undefined) {
      return LIFESTYLE_IMPACTS[factorKey][valueKey];
    }
    
    return 0;
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Lifestyle Factors</h2>
        <p className="text-muted-foreground">
          Adjust these factors to see how they impact your life expectancy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(LIFESTYLE_IMPACTS).map((factor) => {
          const factorValue = profile[factor as keyof UserProfile] as string;
          const impact = getImpactValue(factor, factorValue);
          
          return (
            <LifestyleFactorCard
              key={factor}
              factor={factor}
              value={factorValue}
              impact={impact}
              onChange={(value) => handleFactorChange(factor as keyof UserProfile, value)}
            />
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={onComplete}
          className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          See Your Results
        </button>
      </div>
    </div>
  );
};

export default LifestyleFactorsJourney; 