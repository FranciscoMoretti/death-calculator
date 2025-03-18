import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, LIFESTYLE_IMPACTS, getFactorName, getFactorOptions, getImpactColor } from '@/utils/calculationUtils';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityIcon, BrainIcon, CigaretteIcon, DumbbellIcon, GraduationCapIcon, HeartIcon, SaladIcon, UserIcon, WineIcon } from 'lucide-react';

interface LifestyleFactorCardProps {
  factor: string;
  value: string;
  impact: number;
  onChange: (value: string) => void;
}

const getFactorIcon = (factor: string) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
  
  switch (factor) {
    case 'smoking':
      return <CigaretteIcon {...iconProps} />;
    case 'physicalActivity':
      return <DumbbellIcon {...iconProps} />;
    case 'diet':
      return <SaladIcon {...iconProps} />;
    case 'alcohol':
      return <WineIcon {...iconProps} />;
    case 'bmi':
      return <UserIcon {...iconProps} />;
    case 'sleep':
      return <HeartIcon {...iconProps} />;
    case 'stress':
      return <BrainIcon {...iconProps} />;
    case 'socialConnections':
      return <ActivityIcon {...iconProps} />;
    case 'education':
      return <GraduationCapIcon {...iconProps} />;
    default:
      return <ActivityIcon {...iconProps} />;
  }
};

const getFactorDescription = (factor: string): string => {
  const descriptions: Record<string, string> = {
    smoking: "Smoking status significantly impacts life expectancy",
    physicalActivity: "Regular physical activity can add years to your life",
    diet: "Dietary choices have a major effect on longevity",
    alcohol: "Alcohol consumption patterns affect health outcomes",
    bmi: "Body mass index relates to various health risks",
    sleep: "Sleep duration and quality impact overall health",
    stress: "Chronic stress levels affect both mental and physical health",
    socialConnections: "Social relationships are a key predictor of longevity",
    education: "Education level correlates with life expectancy",
  };
  
  return descriptions[factor] || "";
};

const LifestyleFactorCard: React.FC<LifestyleFactorCardProps> = ({
  factor,
  value,
  impact,
  onChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl",
        impact > 0 ? "border-2 border-health-positive/50 bg-health-positive/10" : 
        impact < 0 ? "border-2 border-health-negative/50 bg-health-negative/10" : 
        "border-2 border-white/20 bg-white/10"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 items-center">
              <motion.div 
                className={cn(
                  "p-3 rounded-full",
                  impact > 0 ? "bg-health-positive/30 text-health-positive" : 
                  impact < 0 ? "bg-health-negative/30 text-health-negative" : 
                  "bg-white/20 text-white"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {getFactorIcon(factor)}
              </motion.div>
              <div>
                <motion.h3 
                  className="text-lg font-semibold text-white mb-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {getFactorName(factor)}
                </motion.h3>
                <motion.p 
                  className="text-sm text-white/70"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {getFactorDescription(factor)}
                </motion.p>
              </div>
            </div>
            
            <motion.div 
              className={cn(
                "px-4 py-2 rounded-full font-medium text-sm",
                impact > 0 ? "bg-health-positive/30 text-health-positive border border-health-positive/50" : 
                impact < 0 ? "bg-health-negative/30 text-health-negative border border-health-negative/50" : 
                "bg-white/20 text-white/70 border border-white/20"
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {impact > 0 ? "+" : ""}{impact.toFixed(1)} years
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Select
              value={value}
              onValueChange={onChange}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 hover:bg-white/20 transition-colors text-white">
                <SelectValue placeholder={`Select ${getFactorName(factor)}`} />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-2 border-white/20">
                {getFactorOptions(factor).map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-white/20 focus:bg-white/20"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LifestyleFactorCard; 