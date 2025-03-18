
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
import ResultsDrawer from '@/components/ResultsDrawer';
import { Button } from '@/components/ui/button';
import { HeartPulse, BarChart, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(getDefaultProfile());
  const [calculationResult, setCalculationResult] = useState(calculateLifeExpectancy(profile));
  const [drawerOpen, setDrawerOpen] = useState(false);
  
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
    <div className="min-h-screen bg-background pb-20">
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
      
      <div className="container max-w-md mx-auto px-4 pb-24 space-y-8">
        <div 
          style={staggeredSections.find(s => s.key === 'form')?.delay ? {
            animationDelay: `${staggeredSections.find(s => s.key === 'form')?.delay}ms`
          } : {}}
          className="animate-scale-in space-y-8"
        >
          {/* Basic Information */}
          <div className="bg-card rounded-xl p-5 shadow-sm">
            <BaselineForm 
              profile={profile}
              onChange={setProfile}
            />
          </div>
          
          {/* Lifestyle Factors */}
          <div className="bg-card rounded-xl p-5 shadow-sm">
            <LifestyleFactors 
              profile={profile}
              onChange={setProfile}
            />
          </div>
          
          {/* Results Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setDrawerOpen(true)}
              size="lg"
              className="w-full py-6 text-base flex items-center gap-2"
            >
              <BarChart className="h-5 w-5" />
              View Your Results
            </Button>
          </div>
          
          {/* Current Life Expectancy Preview */}
          <div className="bg-accent/30 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Current Life Expectancy</p>
            <h2 className="text-3xl font-bold">
              {calculationResult.adjustedLifeExpectancy.toFixed(1)} years
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click to see detailed analysis
            </p>
          </div>
          
          {/* Best Impact Factor Preview */}
          {topSuggestions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-md font-medium mb-3">Top Suggestion</h3>
              <div className="p-4 rounded-lg bg-accent/30 flex items-start gap-3">
                <div className="mt-1 bg-primary/10 rounded-full p-1.5 flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {topSuggestions[0].potentialImprovement.toFixed(1)} years potential gain
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Change your {topSuggestions[0].factor.replace(/([A-Z])/g, ' $1').toLowerCase()} 
                    to get the biggest impact
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                >
                  See All Recommendations
                </Button>
              </div>
            </div>
          )}
          
          <div className="text-xs text-center text-muted-foreground pt-2">
            Based on epidemiological studies and meta-analyses.
            <br />Individual results may vary based on genetics and other factors.
          </div>
        </div>
      </div>
      
      {/* Results Drawer */}
      <ResultsDrawer
        calculationResult={calculationResult}
        suggestions={topSuggestions}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default Index;
