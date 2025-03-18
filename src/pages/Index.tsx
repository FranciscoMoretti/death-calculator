
import React, { useState, useEffect } from 'react';
import { 
  calculateLifeExpectancy, 
  calculateComparisonData, 
  getDefaultProfile, 
  UserProfile,
  LIFESTYLE_IMPACTS,
  getFactorName 
} from '@/utils/calculationUtils';
import { useStaggeredAnimation } from '@/utils/animationUtils';
import BaselineForm from '@/components/BaselineForm';
import LifestyleFactors from '@/components/LifestyleFactors';
import LifeExpectancyChart from '@/components/LifeExpectancyChart';
import ComparisonView from '@/components/ComparisonView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp, HeartPulse, RefreshCw, ArrowRight, TrendingUp, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
          // Type assertion to ensure TypeScript understands this is a valid key
          const factorKey = factor as keyof UserProfile;
          updatedComparisonProfile[factorKey] = comparisonProfile[factorKey];
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

  // Find high-impact habits that could be improved
  const getHighImpactSuggestions = () => {
    const suggestions = [];
    const factors = Object.entries(calculationResult.impactByFactor);
    
    // Sort by potential improvement (negative impact first)
    factors.sort((a, b) => a[1] - b[1]);
    
    // Get the top negative impact factors
    for (const [factor, impact] of factors) {
      if (impact < 0) {
        // Find the best possible value for this factor
        const factorKey = factor as keyof typeof LIFESTYLE_IMPACTS;
        if (LIFESTYLE_IMPACTS[factorKey]) {
          const options = Object.entries(LIFESTYLE_IMPACTS[factorKey]);
          const bestOption = options.sort((a, b) => b[1] - a[1])[0];
          
          const improvement = bestOption[1] - impact;
          if (improvement > 0) {
            suggestions.push({
              factor,
              currentImpact: impact,
              bestOption: bestOption[0],
              potentialImprovement: improvement,
              label: `${getFactorName(factor)}: ${bestOption[0]}`
            });
          }
        }
      }
      
      // Limit to top 3 suggestions
      if (suggestions.length >= 3) break;
    }
    
    return suggestions;
  };

  const createImprovementSimulation = (suggestion: any) => {
    const simulatedProfile = { ...profile };
    simulatedProfile[suggestion.factor as keyof UserProfile] = suggestion.bestOption as any;
    
    const simulatedResult = calculateLifeExpectancy(simulatedProfile);
    const yearsDifference = simulatedResult.adjustedLifeExpectancy - calculationResult.adjustedLifeExpectancy;
    
    return {
      profile: simulatedProfile,
      result: simulatedResult,
      yearsDifference
    };
  };

  const suggestionsSection = () => {
    const topSuggestions = getHighImpactSuggestions();
    
    if (topSuggestions.length === 0) {
      return (
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">Great job!</h3>
          <p className="text-muted-foreground">
            Based on your profile, you're already making healthy lifestyle choices!
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">High Impact Improvements</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Making these changes could significantly increase your life expectancy:
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {topSuggestions.map((suggestion, index) => {
            const simulation = createImprovementSimulation(suggestion);
            
            return (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <Card className="overflow-hidden border border-border/50 shadow-sm hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                    <CardContent className="p-5">
                      <div className="flex flex-col items-center text-center p-2">
                        <TrendingUp className="h-10 w-10 text-health-positive mb-3" />
                        <h4 className="font-medium mb-1">{getFactorName(suggestion.factor)}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Change to: {suggestion.bestOption}
                        </p>
                        <div className="text-health-positive text-xl font-bold">
                          +{suggestion.potentialImprovement.toFixed(1)} years
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Improve your {getFactorName(suggestion.factor).toLowerCase()}</DialogTitle>
                    <DialogDescription>
                      This change could add {simulation.yearsDifference.toFixed(1)} years to your life expectancy.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">Why this matters</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {getFactorDescription(suggestion.factor, suggestion.bestOption)}
                    </p>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm">Current life expectancy</p>
                        <p className="text-xl font-bold">{calculationResult.adjustedLifeExpectancy.toFixed(1)} years</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="h-5 w-5 mx-auto text-health-positive" />
                        <p className="text-health-positive text-sm font-medium">
                          +{simulation.yearsDifference.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Potential life expectancy</p>
                        <p className="text-xl font-bold">{simulation.result.adjustedLifeExpectancy.toFixed(1)} years</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    );
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
            <div className="space-y-8">
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
                <>
                  <div className="max-w-2xl mx-auto">
                    <LifeExpectancyChart data={calculationResult} />
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    {suggestionsSection()}
                  </div>
                </>
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

function getFactorDescription(factor: string, suggestion: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    smoking: {
      never: "Avoiding smoking altogether is one of the most significant things you can do for your health. Studies show that non-smokers live approximately 10 years longer than heavy smokers.",
      former: "Quitting smoking has immediate and long-term health benefits. Even after years of smoking, quitting can add years back to your life expectancy."
    },
    physicalActivity: {
      high: "Regular vigorous physical activity strengthens your heart, improves blood circulation, and reduces the risk of many chronic diseases. Research shows that highly active individuals live 4-5 years longer on average.",
      medium: "Moderate regular physical activity such as brisk walking for 30 minutes daily can significantly extend your life expectancy."
    },
    diet: {
      excellent: "A diet rich in fruits, vegetables, whole grains, and healthy fats while limiting processed foods can add years to your life. The Mediterranean and DASH diets have been linked to longer lifespans in numerous studies.",
      good: "Making healthier food choices most of the time, while occasionally enjoying treats in moderation, can still provide significant health benefits."
    },
    alcohol: {
      none: "Abstaining from alcohol eliminates the risks associated with alcohol consumption, including liver disease, cardiovascular issues, and increased cancer risks.",
      moderate: "If you do drink, limiting intake to moderate levels (1 drink per day for women, 2 for men) minimizes health risks."
    },
    sleep: {
      optimal: "Getting 7-8 hours of quality sleep consistently helps your body repair itself, strengthens immune function, and improves overall health. Studies show optimal sleepers live longer than those with poor sleep habits."
    },
    stress: {
      low: "Managing stress through practices like meditation, exercise, and proper work-life balance can add years to your life by reducing inflammation and improving mental health."
    },
    socialConnections: {
      strong: "Maintaining strong social connections can add up to 5 years to your life expectancy. Social isolation is as harmful to health as smoking 15 cigarettes a day according to research."
    },
    bmi: {
      healthy: "Maintaining a healthy weight reduces your risk of heart disease, diabetes, and certain cancers. A BMI between 18.5-24.9 is associated with the lowest mortality risk."
    },
    education: {
      advanced: "Higher education levels are associated with longer lifespans, likely due to better health literacy, higher income, and healthier lifestyle choices."
    }
  };
  
  return descriptions[factor]?.[suggestion] || 
    "Making this change could significantly improve your health outcomes and extend your life expectancy based on epidemiological research.";
}

export default Index;
