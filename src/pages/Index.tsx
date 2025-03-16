import React, { useState, useEffect } from 'react';
import { 
  calculateLifeExpectancy, 
  calculateComparisonData, 
  getDefaultProfile, 
  UserProfile 
} from '@/utils/calculationUtils';
import { useStaggeredAnimation } from '@/utils/animationUtils';
import BaselineForm from '@/components/BaselineForm';
import LifestyleFactors from '@/components/LifestyleFactors';
import LifeExpectancyChart from '@/components/LifeExpectancyChart';
import ComparisonView from '@/components/ComparisonView';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HeartPulse, RefreshCw } from 'lucide-react';
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
      setShowScrollArrow(document.body.scrollHeight > window.innerHeight);
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
      
      <div className="container max-w-6xl pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-8">
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
            
            <div className="flex justify-center pt-4">
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
          </div>
          
          <div 
            style={staggeredSections.find(s => s.key === 'results')?.delay ? {
              animationDelay: `${staggeredSections.find(s => s.key === 'results')?.delay}ms`
            } : {}}
            className="lg:col-span-7 space-y-8 animate-slide-up"
          >
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
              <LifeExpectancyChart data={calculationResult} />
            )}
            
            <div className="p-6 bg-accent/50 rounded-xl">
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
