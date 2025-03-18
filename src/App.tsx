import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { Landing } from './pages/Landing';
import { useState } from 'react';
import { UserProfile, getDefaultProfile } from '@/utils/calculationUtils';
import BaselineForm from '@/components/BaselineForm';
import LifestyleFactors from '@/components/LifestyleFactors';
import ResultsView from '@/components/ResultsView';

const queryClient = new QueryClient();

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(getDefaultProfile());

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BaselineForm 
            profile={profile}
            onChange={setProfile}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <LifestyleFactors 
            profile={profile}
            onChange={setProfile}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <ResultsView 
            profile={profile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <div className="container max-w-4xl mx-auto py-8">
                {renderStep()}
              </div>
            } />
            <Route path="/landing" element={<Landing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
