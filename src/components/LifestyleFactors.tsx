
import React from 'react';
import { UserProfile, LIFESTYLE_IMPACTS, getFactorName, getFactorOptions, getImpactColor } from '@/utils/calculationUtils';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityIcon, BrainIcon, CigaretteIcon, DumbbellIcon, GraduationCapIcon, HeartIcon, SaladIcon, UserIcon, WineIcon } from 'lucide-react';

interface LifestyleFactorsProps {
  profile: UserProfile;
  onChange: (updatedProfile: UserProfile) => void;
  className?: string;
}

const getFactorIcon = (factor: string) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
  
  switch (factor) {
    case 'smoking':
      return <CigaretteIcon {...iconProps} />;
    case 'physicalActivity':
      return <DumbbellIcon {...iconProps} />;
    case 'diet':
      return <SaladIcon {...iconProps} />;
    case 'alcohol':
      return <WineIcon {...iconProps} />;
    case 'bmi':
      return <UserIcon {...iconProps} />;
    case 'sleep':
      return <HeartIcon {...iconProps} />;
    case 'stress':
      return <BrainIcon {...iconProps} />;
    case 'socialConnections':
      return <ActivityIcon {...iconProps} />;
    case 'education':
      return <GraduationCapIcon {...iconProps} />;
    default:
      return <ActivityIcon {...iconProps} />;
  }
};

const getFactorDescription = (factor: string): string => {
  const descriptions: Record<string, string> = {
    smoking: "Smoking status significantly impacts life expectancy",
    physicalActivity: "Regular physical activity can add years to your life",
    diet: "Dietary choices have a major effect on longevity",
    alcohol: "Alcohol consumption patterns affect health outcomes",
    bmi: "Body mass index relates to various health risks",
    sleep: "Sleep duration and quality impact overall health",
    stress: "Chronic stress levels affect both mental and physical health",
    socialConnections: "Social relationships are a key predictor of longevity",
    education: "Education level correlates with life expectancy",
  };
  
  return descriptions[factor] || "";
};

const LifestyleFactors: React.FC<LifestyleFactorsProps> = ({ 
  profile, 
  onChange,
  className 
}) => {
  const handleFactorChange = (factor: keyof UserProfile, value: string) => {
    const updatedProfile = {
      ...profile,
      [factor]: value
    };
    onChange(updatedProfile);
  };
  
  // Get impact value for current selection
  const getImpactValue = (factor: string, value: string) => {
    const factorKey = factor as keyof typeof LIFESTYLE_IMPACTS;
    const valueKey = value as keyof (typeof LIFESTYLE_IMPACTS)[typeof factorKey];
    
    if (LIFESTYLE_IMPACTS[factorKey]?.[valueKey] !== undefined) {
      return LIFESTYLE_IMPACTS[factorKey][valueKey];
    }
    
    return 0;
  };
  
  return (
    <div className={cn("form-section max-w-4xl mx-auto", className)}>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Lifestyle Factors</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Adjust these factors to see how they impact your life expectancy
      </p>
      
      <div className="space-y-5">
        {Object.keys(LIFESTYLE_IMPACTS).map((factor) => {
          const factorValue = profile[factor as keyof UserProfile] as string;
          const impact = getImpactValue(factor, factorValue);
          const impactColor = getImpactColor(impact);
          
          return (
            <Card key={factor} className="overflow-hidden border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className={cn(
                      "p-2 rounded-full",
                      impact > 0 ? "bg-health-positive/10" : 
                      impact < 0 ? "bg-health-negative/10" : 
                      "bg-muted"
                    )}>
                      {getFactorIcon(factor)}
                    </div>
                    <div>
                      <h3 className="font-medium">{getFactorName(factor)}</h3>
                      <p className="text-xs text-muted-foreground">{getFactorDescription(factor)}</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    impact > 0 ? "bg-health-positive/10 text-health-positive" : 
                    impact < 0 ? "bg-health-negative/10 text-health-negative" : 
                    "bg-muted text-muted-foreground"
                  )}>
                    {impact > 0 ? "+" : ""}{impact.toFixed(1)} years
                  </div>
                </div>
                
                <div className="mt-4">
                  <Select
                    value={factorValue}
                    onValueChange={(value) => handleFactorChange(factor as keyof UserProfile, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${getFactorName(factor)}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFactorOptions(factor).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LifestyleFactors;
