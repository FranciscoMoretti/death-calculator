
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, HeartPulse, RefreshCw, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(getDefaultProfile());
  const [calculationResult, setCalculationResult] = useState(calculateLifeExpectancy(profile));
  const [comparisonProfile, setComparisonProfile] = useState<UserProfile | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basics");
  
  const sections = ['header', 'content'];
  const staggeredSections = useStaggeredAnimation(sections, 100, 150);
  
  useEffect(() => {
    setCalculationResult(calculateLifeExpectancy(profile));
    
    if (comparisonProfile) {
      const changedFactors = getChangedFactors(profile, comparisonProfile);
      const updatedComparisonProfile = { ...profile };
      
      changedFactors.forEach(factor => {
        if (factor !== 'age' && factor !== 'gender') {
          updatedComparisonProfile[factor as keyof UserProfile] = comparisonProfile[factor as keyof UserProfile];
        }
      });
      
      setComparisonProfile(updatedComparisonProfile);
      const comparison = calculateComparisonData(profile, updatedComparisonProfile);
      setComparisonResult(comparison);
    }
  }, [profile]);
  
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
  
  const goToNextTab = () => {
    if (activeTab === "basics") {
      setActiveTab("lifestyle");
    } else if (activeTab === "lifestyle") {
      setActiveTab("results");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div 
        style={staggeredSections.find(s => s.key === 'header')?.delay ? {
          animationDelay: `${staggeredSections.find(s => s.key === 'header')?.delay}ms`
        } : {}}
        className="animate-slide-down pt-10 pb-8 px-6 text-center"
      >
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <HeartPulse className="h-6 w-6 text-health-positive" />
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
            Longevity Calculator
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Discover Your Life Expectancy
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          See how your lifestyle choices impact your longevity, based on scientific research.
        </p>
      </div>
      
      <div 
        style={staggeredSections.find(s => s.key === 'content')?.delay ? {
          animationDelay: `${staggeredSections.find(s => s.key === 'content')?.delay}ms`
        } : {}}
        className="container max-w-4xl pb-20 animate-scale-in"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basics" className="text-sm md:text-base">
              1. Basic Information
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-sm md:text-base">
              2. Lifestyle Factors
            </TabsTrigger>
            <TabsTrigger value="results" className="text-sm md:text-base">
              3. Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="mt-0">
            <div className="max-w-lg mx-auto">
              <BaselineForm 
                profile={profile}
                onChange={setProfile}
                className="mb-6"
              />
              
              <div className="flex justify-end">
                <Button onClick={goToNextTab} className="flex items-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="lifestyle" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <LifestyleFactors 
                profile={comparisonProfile || profile}
                onChange={comparisonProfile ? setComparisonProfile : setProfile}
              />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setActiveTab("basics")}>
                  Back
                </Button>
                <Button onClick={goToNextTab} className="flex items-center gap-2">
                  See Results <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="mt-0">
            <div className="space-y-6">
              {comparisonProfile && comparisonResult ? (
                <>
                  <div className="bg-secondary/30 rounded-lg p-3 text-center text-sm max-w-2xl mx-auto">
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
                <div className="max-w-2xl mx-auto">
                  <LifeExpectancyChart data={calculationResult} />
                </div>
              )}
              
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={() => setActiveTab("lifestyle")}>
                  Back to Lifestyle Factors
                </Button>
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
              
              <div className="p-6 bg-accent/50 rounded-xl max-w-2xl mx-auto mt-8">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
