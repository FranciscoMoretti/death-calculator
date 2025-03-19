import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, HeartPulse, Clock } from 'lucide-react';
import { calculateLifeExpectancy, UserProfile } from '@/utils/calculationUtils';
import LifeExpectancyChart from './LifeExpectancyChart';

interface ResultsViewProps {
  profile: UserProfile;
}

const ResultsView: React.FC<ResultsViewProps> = ({ profile }) => {
  const result = calculateLifeExpectancy(profile);
  const weekendsLeft = result.totalYearsRemaining * 52;
  const heartbeatsLeft = result.totalYearsRemaining * 365 * 24 * 60 * 80; // Assuming 80 beats per minute average

  return (
    <div className="space-y-8">
      <LifeExpectancyChart data={result} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/95 backdrop-blur-sm border-2 border-white/20 p-4 rounded-lg text-center animate-scale-in shadow-lg"
        >
          <Calendar className="h-8 w-8 mx-auto mb-2 text-health-blue" />
          <h3 className="text-3xl font-bold text-white">{Math.round(weekendsLeft)}</h3>
          <p className="text-sm text-white/70">Weekends Left</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-black/95 backdrop-blur-sm border-2 border-white/20 p-4 rounded-lg text-center animate-scale-in shadow-lg"
        >
          <HeartPulse className="h-8 w-8 mx-auto mb-2 text-health-purple" />
          <h3 className="text-3xl font-bold text-white">{Math.round(heartbeatsLeft / 1000000)}M</h3>
          <p className="text-sm text-white/70">Heartbeats Left</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-black/95 backdrop-blur-sm border-2 border-white/20 p-4 rounded-lg text-center animate-scale-in shadow-lg"
        >
          <Clock className="h-8 w-8 mx-auto mb-2 text-health-orange" />
          <h3 className="text-3xl font-bold text-white">{result.totalYearsRemaining.toFixed(1)}</h3>
          <p className="text-sm text-white/70">Years Left</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-black/95 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 animate-scale-in shadow-lg"
      >
        <h3 className="text-lg font-medium mb-3 text-white/70">Your Life Timeline</h3>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(profile.age / result.adjustedLifeExpectancy) * 100}%` }}
            transition={{ duration: 1, delay: 1 }}
            className="h-full bg-health-positive"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-white/70">
          <span>Birth</span>
          <span>Now ({profile.age})</span>
          <span>End ({result.adjustedLifeExpectancy.toFixed(1)})</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsView; 