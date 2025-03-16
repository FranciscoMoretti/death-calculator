
import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UserProfile, getFactorChoiceName, getFactorName } from '@/utils/calculationUtils';
import { useAnimatedNumber } from '@/utils/animationUtils';
import { cn } from '@/lib/utils';

interface ComparisonViewProps {
  originalResult: any;
  modifiedResult: any;
  difference: number;
  originalProfile: UserProfile;
  modifiedProfile: UserProfile;
  changedFactors: string[];
  className?: string;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalResult,
  modifiedResult,
  difference,
  originalProfile,
  modifiedProfile,
  changedFactors,
  className,
}) => {
  const animatedDifference = useAnimatedNumber(difference, 1500);
  
  // Create data for the age progression chart
  const chartData = React.useMemo(() => {
    const data = [];
    const currentAge = originalProfile.age;
    // Get data points for every 5 years
    for (let i = 0; i <= 85; i += 5) {
      const age = currentAge + i;
      // Don't go beyond predicted death
      if (age > originalResult.adjustedLifeExpectancy && 
          age > modifiedResult.adjustedLifeExpectancy) {
        break;
      }
      
      const isAliveOriginal = age <= originalResult.adjustedLifeExpectancy;
      const isAliveModified = age <= modifiedResult.adjustedLifeExpectancy;
      
      data.push({
        age,
        original: isAliveOriginal ? 1 : 0,
        modified: isAliveModified ? 1 : 0,
        label: `Age ${age}`,
      });
    }
    
    // Add exact endpoints for more precise visualization
    if (originalResult.adjustedLifeExpectancy > currentAge) {
      data.push({
        age: originalResult.adjustedLifeExpectancy,
        original: 0,
        modified: modifiedResult.adjustedLifeExpectancy > originalResult.adjustedLifeExpectancy ? 1 : 0,
        label: `Original End: ${originalResult.adjustedLifeExpectancy.toFixed(1)}`,
      });
    }
    
    if (modifiedResult.adjustedLifeExpectancy > currentAge &&
        Math.abs(modifiedResult.adjustedLifeExpectancy - originalResult.adjustedLifeExpectancy) > 0.1) {
      data.push({
        age: modifiedResult.adjustedLifeExpectancy,
        original: 0,
        modified: 0,
        label: `Modified End: ${modifiedResult.adjustedLifeExpectancy.toFixed(1)}`,
      });
    }
    
    // Sort by age
    return data.sort((a, b) => a.age - b.age);
  }, [originalResult, modifiedResult, originalProfile.age]);
  
  return (
    <div className={cn("chart-container space-y-6", className)}>
      <div className="text-center mb-6">
        <div className="mb-3">
          <span className={cn(
            "health-tag inline-block",
            difference > 0 ? "health-tag-positive" : 
            difference < 0 ? "health-tag-negative" : 
            "health-tag-neutral"
          )}>
            {difference > 0 
              ? 'Positive Impact' 
              : difference < 0 
                ? 'Negative Impact' 
                : 'No Change'}
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          {difference > 0 ? '+' : ''}{animatedDifference.toFixed(1)} Years
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Life expectancy {difference >= 0 ? 'increase' : 'decrease'} with changed factors
        </p>
      </div>
      
      <div className="border-t border-border pt-4">
        <h3 className="text-md font-medium mb-2">Changed Lifestyle Factors</h3>
        <ul className="space-y-2 text-sm">
          {changedFactors.map(factor => (
            <li key={factor} className="flex justify-between p-2 bg-secondary/50 rounded-md">
              <span className="font-medium">{getFactorName(factor)}</span>
              <div className="flex gap-1 items-center">
                <span className="text-muted-foreground">
                  {getFactorChoiceName(factor, originalProfile[factor as keyof UserProfile] as string)}
                </span>
                <span className="px-2">→</span>
                <span className={cn(
                  modifiedResult.impactByFactor[factor] > originalResult.impactByFactor[factor]
                    ? "text-health-positive font-medium"
                    : modifiedResult.impactByFactor[factor] < originalResult.impactByFactor[factor]
                      ? "text-health-negative font-medium"
                      : "text-muted-foreground"
                )}>
                  {getFactorChoiceName(factor, modifiedProfile[factor as keyof UserProfile] as string)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="pt-4">
        <h3 className="text-md font-medium mb-2">Life Expectancy Comparison</h3>
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="age" 
                label={{ 
                  value: 'Age', 
                  position: 'insideBottom',
                  offset: -5,
                  style: { fontSize: '12px', fill: '#64748b' }
                }} 
              />
              <YAxis hide={true} />
              <Tooltip 
                formatter={(value, name) => {
                  if (value === 0) return ["Deceased", name === "original" ? "Original" : "Modified"];
                  return ["Living", name === "original" ? "Original" : "Modified"];
                }}
                labelFormatter={(label) => {
                  if (typeof label === 'number') {
                    return `Age ${label.toFixed(1)}`;
                  }
                  return label;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="original" 
                stackId="1"
                name="Original"
                stroke="#94A3B8" 
                fill="#94A3B8" 
                fillOpacity={0.4}
              />
              <Area 
                type="monotone" 
                dataKey="modified" 
                stackId="2" 
                name="Modified"
                stroke="#60A5FA" 
                fill="#60A5FA" 
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <div>Current Age: {originalProfile.age}</div>
          <div className="flex gap-3">
            <span>Original: {originalResult.adjustedLifeExpectancy.toFixed(1)} years</span>
            <span>Modified: {modifiedResult.adjustedLifeExpectancy.toFixed(1)} years</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
