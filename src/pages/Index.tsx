
import React, { useState, useEffect } from 'react';
import { 
  calculateLifeExpectancy, 
  calculateComparisonData, 
  getDefaultProfile, 
  UserProfile, 
  LIFESTYLE_IMPACTS
} from '@/utils/calculationUtils';
import { useStaggeredAnimation } from '@/utils/animationUtils';
import BaselineForm from '@/components/BaselineForm';
import LifestyleFactors from '@/components/LifestyleFactors';
import LifeExpectancyChart from '@/components/LifeExpectancyChart';
import { Button } from '@/components/ui/button';
import { HeartPulse, BarChart, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';

const Index = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(getDefaultProfile());
  const [calculationResult, setCalculationResult] = useState(calculateLifeExpectancy(profile));
  const isMobile = useIsMobile();
  
  const sections = ['header', 'form'];
  const staggeredSections = useStaggeredAnimation(sections, 100, 150);
  
  useEffect(() => {
    setCalculationResult(calculateLifeExpectancy(profile));
  }, [profile]);
  
  // Get highest impact factor for suggestions
  const getHighestImpactFactors = () => {
    const impactFactors = Object.keys(LIFESTYLE_IMPACTS).map(factor => {
      const currentValue = profile[factor as keyof UserProfile] as string;
      const options = Object.entries(LIFESTYLE_IMPACTS[factor as keyof typeof LIFESTYLE_IMPACTS]);
      
      // Find best possible option for this factor
      const bestOption = options.reduce((best, current) => {
        return current[1] > best[1] ? current : best;
      }, ['', -100]);
      
      // Current impact
      const currentImpact = LIFESTYLE_IMPACTS[factor as keyof typeof LIFESTYLE_IMPACTS][currentValue as keyof (typeof LIFESTYLE_IMPACTS)[keyof typeof LIFESTYLE_IMPACTS]] || 0;
      
      // Potential improvement
      const potentialImprovement = bestOption[1] - currentImpact;
      
      return {
        factor,
        currentValue,
        bestOption: bestOption[0],
        potentialImprovement,
        currentImpact
      };
    });
    
    // Sort by potential improvement descending
    return impactFactors.sort((a, b) => b.potentialImprovement - a.potentialImprovement);
  };

  const highestImpactFactors = getHighestImpactFactors();
  const topSuggestions = highestImpactFactors.filter(item => item.potentialImprovement > 0).slice(0, 3);
  
  return (
    <div className="min-h-screen bg-background pb-8">
      <div 
        style={staggeredSections.find(s => s.key === 'header')?.delay ? {
          animationDelay: `${staggeredSections.find(s => s.key === 'header')?.delay}ms`
        } : {}}
        className="animate-slide-down pt-8 pb-6 px-4 text-center"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <HeartPulse className="h-5 w-5 text-health-positive" />
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
            Life Expectancy
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Your Longevity Calculator
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          See how your lifestyle choices impact your longevity.
        </p>
      </div>
      
      <div className="container mx-auto max-w-7xl px-4">
        <div 
          style={staggeredSections.find(s => s.key === 'form')?.delay ? {
            animationDelay: `${staggeredSections.find(s => s.key === 'form')?.delay}ms`
          } : {}}
          className="animate-scale-in"
        >
          {isMobile ? (
            // Mobile layout - stacked
            <div className="space-y-6">
              {/* Input forms */}
              <div className="space-y-4">
                <Card className="p-4">
                  <BaselineForm profile={profile} onChange={setProfile} />
                </Card>
                <Card className="p-4">
                  <LifestyleFactors profile={profile} onChange={setProfile} />
                </Card>
              </div>
              
              {/* Results panel */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-accent/30 rounded-lg">
                    <span className="text-sm text-muted-foreground block mb-1">Your Life Expectancy</span>
                    <h2 className="text-3xl font-bold">
                      {calculationResult.adjustedLifeExpectancy.toFixed(1)} years
                    </h2>
                  </div>
                  
                  <LifeExpectancyChart data={calculationResult} />
                  
                  {topSuggestions.length > 0 && (
                    <div className="space-y-3 mt-6 pt-4 border-t border-border">
                      <h3 className="font-medium">Top Suggestions</h3>
                      {topSuggestions.map((item) => (
                        <div key={item.factor} className="p-3 rounded-lg bg-accent/30 flex items-start gap-3">
                          <div className="mt-1 bg-primary/10 rounded-full p-1.5 flex-shrink-0">
                            <ArrowRight className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {item.potentialImprovement.toFixed(1)} years potential gain
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Change {item.factor.replace(/([A-Z])/g, ' $1').toLowerCase()} 
                              from {item.currentValue.charAt(0).toUpperCase() + item.currentValue.slice(1).replace(/([A-Z])/g, ' $1')} 
                              to {item.bestOption.charAt(0).toUpperCase() + item.bestOption.slice(1).replace(/([A-Z])/g, ' $1')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            // Desktop layout - side-by-side resizable panels
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border min-h-[70vh]">
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full overflow-y-auto p-6 space-y-8">
                  <Card className="p-5 shadow-sm">
                    <BaselineForm profile={profile} onChange={setProfile} className="mb-0" />
                  </Card>
                  <Card className="p-5 shadow-sm">
                    <LifestyleFactors profile={profile} onChange={setProfile} className="mb-0" />
                  </Card>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={60}>
                <div className="h-full overflow-y-auto p-6 border-l">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8 p-4 bg-accent/30 rounded-lg">
                      <span className="text-sm text-muted-foreground block mb-1">Your Life Expectancy</span>
                      <h2 className="text-3xl font-bold">
                        {calculationResult.adjustedLifeExpectancy.toFixed(1)} years
                      </h2>
                    </div>
                    
                    <LifeExpectancyChart data={calculationResult} />
                    
                    {topSuggestions.length > 0 && (
                      <div className="space-y-4 mt-10 pt-6 border-t border-border">
                        <h3 className="text-lg font-medium">Top Suggestions for Improvement</h3>
                        {topSuggestions.map((item) => (
                          <div key={item.factor} className="p-4 rounded-lg bg-accent/30">
                            <p className="font-medium">
                              {item.factor.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-muted-foreground">
                                {item.currentValue.charAt(0).toUpperCase() + item.currentValue.slice(1).replace(/([A-Z])/g, ' $1')}
                              </span>
                              <span className="mx-2 text-sm">→</span>
                              <span className="text-sm font-medium text-health-positive">
                                {item.bestOption.charAt(0).toUpperCase() + item.bestOption.slice(1).replace(/([A-Z])/g, ' $1')}
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
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
      
      <div className="text-xs text-center text-muted-foreground pt-8">
        Based on epidemiological studies and meta-analyses.
        <br />Individual results may vary based on genetics and other factors.
      </div>
    </div>
  );
};

export default Index;
