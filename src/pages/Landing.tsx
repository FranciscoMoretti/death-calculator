import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartbeatAnimation } from '../components/HeartbeatAnimation';
import LifestyleFactorsJourney from '../components/LifestyleFactorsJourney';
import { getDefaultProfile, UserProfile } from '@/utils/calculationUtils';
import ResultsView from '../components/ResultsView';

export const Landing = () => {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
  const [currentStep, setCurrentStep] = useState<'awakening' | 'reflection' | 'results'>('awakening');
  const [timeSpent, setTimeSpent] = useState<string>('');

  useEffect(() => {
    if (profile.age) {
      const yearsLived = profile.age;
      const potentialLife = 85; // Average life expectancy
      const percentageLived = ((yearsLived / potentialLife) * 100).toFixed(1);
      setTimeSpent(`${percentageLived}%`);
    }
  }, [profile.age]);

  const handleContinue = () => {
    setCurrentStep('reflection');
  };

  const handleShowResults = () => {
    setCurrentStep('results');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <HeartbeatAnimation />
      </div>
      
      <div className="relative z-10">
        {currentStep === 'awakening' ? (
          <motion.div 
            className="min-h-screen flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-8 max-w-md w-full p-8">
              <h1 className="text-4xl font-bold text-center">
                Death Calculator
              </h1>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 opacity-80">
                    Time already spent...
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    placeholder="Your age"
                    className="w-full bg-transparent border border-white/20 rounded-lg p-3 focus:outline-none focus:border-white/40"
                  />
                  {timeSpent && (
                    <motion.p 
                      className="mt-2 text-sm opacity-60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      You've already lived {timeSpent} of your potential life
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-80">
                    Your gender
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['male', 'female'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setProfile({ ...profile, gender: option as 'male' | 'female' })}
                        className={`
                          p-3 rounded-lg border transition-all duration-300
                          ${profile.gender === option 
                            ? 'border-white bg-white/10' 
                            : 'border-white/20 hover:border-white/40'
                          }
                        `}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {profile.age > 0 && profile.gender && (
                  <motion.button
                    className="w-full bg-white text-black rounded-lg p-3 font-medium hover:bg-white/90 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinue}
                  >
                    Continue Your Journey
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : currentStep === 'reflection' ? (
          <motion.div
            className="min-h-screen py-20 px-4 md:px-8 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-6xl mx-auto">
              <LifestyleFactorsJourney
                profile={profile}
                onChange={setProfile}
                onComplete={handleShowResults}
              />
            </div>
          </motion.div>
        ) : currentStep === 'results' ? (
          <motion.div
            className="min-h-screen py-20 px-4 md:px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto">
              <ResultsView profile={profile} />
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};