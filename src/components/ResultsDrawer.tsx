
import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { LineChart } from 'lucide-react';
import LifeExpectancyChart from './LifeExpectancyChart';
import { LifeExpectancyResult, UserProfile } from '@/utils/calculationUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResultsDrawerProps {
  calculationResult: LifeExpectancyResult;
  suggestions: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResultsDrawer: React.FC<ResultsDrawerProps> = ({ 
  calculationResult, 
  suggestions, 
  open, 
  onOpenChange 
}) => {
  const isMobile = useIsMobile();
  
  // Helper functions for formatting suggestions
  const getFactorName = (factor: string): string => {
    const names: Record<string, string> = {
      smoking: "Smoking",
      physicalActivity: "Physical Activity",
      diet: "Diet Quality",
      alcohol: "Alcohol Consumption",
      bmi: "Body Mass Index",
      sleep: "Sleep Quality",
      stress: "Stress Management",
      socialConnections: "Social Connections",
      education: "Education Level"
    };
    return names[factor] || factor;
  };
  
  const getCurrentOptionLabel = (factor: string, value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1');
  };
  
  const getBestOptionLabel = (factor: string, value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1');
  };
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className={isMobile ? "h-[85vh]" : "h-[60vh] max-w-[500px] mx-auto rounded-t-[12px]"}>
        <DrawerHeader className="text-left px-4 pt-4 pb-2">
          <DrawerTitle className="text-lg font-semibold">Your Life Expectancy Results</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto">
          <LifeExpectancyChart data={calculationResult} />
          
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-medium mb-4">Top Suggestions for Improvement</h3>
            
            {suggestions.length === 0 ? (
              <div className="bg-accent/30 rounded-lg p-6 text-center">
                <p className="font-medium">Your lifestyle choices are already optimal!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your current lifestyle choices are already maximizing your life expectancy.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((item, index) => (
                  <div key={item.factor} className="p-4 rounded-lg bg-accent/30">
                    <p className="font-medium">{getFactorName(item.factor)}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        {getCurrentOptionLabel(item.factor, item.currentValue)}
                      </span>
                      <span className="mx-2 text-sm">→</span>
                      <span className="text-sm font-medium text-health-positive">
                        {getBestOptionLabel(item.factor, item.bestOption)}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-health-positive font-medium">
                      Potential gain: +{item.potentialImprovement.toFixed(1)} years
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ResultsDrawer;
