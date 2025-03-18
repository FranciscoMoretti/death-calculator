
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
import ComparisonView from '@/components/ComparisonView';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HeartPulse, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(getDefaultProfile());
  const [calculationResult, setCalculationResult] = useState(calculateLifeExpectancy(profile));
  const [comparisonProfile, setComparisonProfile] = useState<UserProfile | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  
  const sections = ['header', 'baseline', 'factors', 'results'];
  const staggeredSections = useStaggeredAnimation(sections, 100, 150);
  
  useEffect(() => {
    setCalculationResult(calculateLifeExpectancy(profile));
    
    if (comparisonProfile) {
      const changedFactors = getChangedFactors(profile, comparisonProfile);
      const updatedComparisonProfile = { ...profile };
      
      changedFactors.forEach(factor => {
        updatedComparisonProfile[factor as keyof UserProfile] = comparisonProfile[factor as keyof UserProfile];
      });
      
      setComparisonProfile(updatedComparisonProfile);
      const comparison = calculateComparisonData(profile, updatedComparisonProfile);
      setComparisonResult(comparison);
    }
  }, [profile]);
  
  useEffect(() => {
    const checkScrollable = () => {
      setShowScrollArrow(document.body.scrollHeight > window.innerHeight + 100);
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);
  
  const handleCompare = () => {
    if (comparisonProfile) {
      setComparisonProfile(null);
      setComparisonResult(null);
      toast({
        title: "Comparison reset",
        description: "You can now make changes to create a new comparison.",
      });
    } else {
      setComparisonProfile({ ...profile });
      toast({
        title: "Comparison mode active",
        description: "Make changes to see how they affect your life expectancy.",
      });
    }
  };
  
  const getChangedFactors = (originalProfile: UserProfile, modifiedProfile: UserProfile): string[] => {
    return Object.keys(originalProfile).filter(key => {
      if (key === 'age' || key === 'gender') return false;
      return originalProfile[key as keyof UserProfile] !== modifiedProfile[key as keyof UserProfile];
    });
  };
  
  const scrollDown = () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  // Get highest impact factor for suggestions
  const getHighestImpactFactor = () => {
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

  const highestImpactFactors = getHighestImpactFactor();
  
  const renderSuggestions = () => {
    const topSuggestions = highestImpactFactors.filter(item => item.potentialImprovement > 0).slice(0, 3);
    
    if (topSuggestions.length === 0) {
      return (
        <div className="bg-accent/30 rounded-lg p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-health-positive mb-2" />
          <p className="font-medium">Your lifestyle choices are already optimal!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your current lifestyle choices are already maximizing your life expectancy.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Top Suggestions for Improvement</h3>
        
        {topSuggestions.map((item, index) => {
          const factorName = getFactorName(item.factor);
          
          return (
            <div key={item.factor} className="p-4 rounded-lg bg-accent/30 flex items-center">
              <div className="mr-4 bg-primary/10 rounded-full p-2">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{factorName}: {getCurrentOptionLabel(item.factor, item.currentValue)} → {getBestOptionLabel(item.factor, item.bestOption)}</p>
                <p className="text-sm text-muted-foreground">Potential gain: +{item.potentialImprovement.toFixed(1)} years</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Helper functions for readable labels
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
    // This should return a human-readable label for the current option
    // For simplicity, we'll just return the value with first letter capitalized
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1');
  };
  
  const getBestOptionLabel = (factor: string, value: string): string => {
    // This should return a human-readable label for the best option
    // For simplicity, we'll just return the value with first letter capitalized
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="min-h-screen bg-background">
      <div 
        style={staggeredSections.find(s => s.key === 'header')?.delay ? {
          animationDelay: `${staggeredSections.find(s => s.key === 'header')?.delay}ms`
        } : {}}
        className="animate-slide-down pt-16 pb-10 px-6 text-center"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <HeartPulse className="h-6 w-6 text-health-positive" />
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
            Longevity Calculator
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Discover Your Life Expectancy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See how your lifestyle choices impact your longevity, based on scientific research.
        </p>
      </div>
      
      <div className="container max-w-5xl pb-20 space-y-12">
        {/* Basic Information */}
        <div 
          style={staggeredSections.find(s => s.key === 'baseline')?.delay ? {
            animationDelay: `${staggeredSections.find(s => s.key === 'baseline')?.delay}ms`
          } : {}}
          className="animate-scale-in"
        >
          <BaselineForm 
            profile={profile}
            onChange={setProfile}
          />
        </div>
        
        {/* Lifestyle Factors */}
        <div 
          style={staggeredSections.find(s => s.key === 'factors')?.delay ? {
            animationDelay: `${staggeredSections.find(s => s.key === 'factors')?.delay}ms`
          } : {}}
          className="animate-scale-in"
        >
          <LifestyleFactors 
            profile={comparisonProfile || profile}
            onChange={comparisonProfile ? setComparisonProfile : setProfile}
          />
        </div>
        
        {/* Comparison Button */}
        <div className="flex justify-center pt-2 pb-2">
          <Button 
            onClick={handleCompare}
            variant="outline"
            className="flex items-center gap-2"
          >
            {comparisonProfile ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Reset Comparison
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Start Comparison
              </>
            )}
          </Button>
        </div>
        
        {/* Results */}
        <div 
          style={staggeredSections.find(s => s.key === 'results')?.delay ? {
            animationDelay: `${staggeredSections.find(s => s.key === 'results')?.delay}ms`
          } : {}}
          className="space-y-8 animate-slide-up form-section max-w-4xl mx-auto"
        >
          <h2 className="text-xl font-semibold tracking-tight">Your Results</h2>
          
          {comparisonProfile && comparisonResult ? (
            <>
              <div className="bg-secondary/30 rounded-lg p-3 text-center text-sm">
                <span className="font-medium">Comparison Mode</span> — Comparing your baseline profile with adjusted factors
              </div>
              
              <ComparisonView 
                originalResult={comparisonResult.original}
                modifiedResult={comparisonResult.modified}
                difference={comparisonResult.difference}
                originalProfile={profile}
                modifiedProfile={comparisonProfile}
                changedFactors={getChangedFactors(profile, comparisonProfile)}
              />
            </>
          ) : (
            <>
              <LifeExpectancyChart data={calculationResult} />
              
              <div className="mt-8 pt-6 border-t border-border">
                {renderSuggestions()}
              </div>
            </>
          )}
        </div>
        
        <div className="p-6 bg-accent/50 rounded-xl max-w-4xl mx-auto">
          <h3 className="text-lg font-medium mb-3">About This Calculator</h3>
          <p className="text-sm text-muted-foreground">
            This calculator uses data from multiple epidemiological studies and meta-analyses to estimate life 
            expectancy based on various lifestyle factors. The baseline is derived from average life expectancy
            data, and adjustments are made based on the impact of each factor. While this provides a useful estimate,
            individual results may vary based on genetics, environmental factors, and other variables not included
            in this model.
          </p>
        </div>
      </div>
      
      {showScrollArrow && (
        <button 
          onClick={scrollDown}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full p-3 shadow-md animate-pulse-gentle"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default Index;
