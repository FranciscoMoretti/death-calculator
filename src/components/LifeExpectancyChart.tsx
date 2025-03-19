import React, { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { LifeExpectancyResult } from '@/utils/calculationUtils';
import { useAnimatedNumber, easeOutCubic } from '@/utils/animationUtils';
import { cn } from '@/lib/utils';

interface LifeExpectancyChartProps {
  data: LifeExpectancyResult;
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-black/95 p-4 rounded-lg shadow-lg border-2 border-white/20">
        <p className="font-semibold text-white">{data.name}</p>
        <p className={cn("text-sm", data.color)}>
          {data.impact > 0 ? "+" : ""}{data.impact.toFixed(1)} years
        </p>
        <p className="text-xs text-white/70 mt-1">{data.description}</p>
      </div>
    );
  }

  return null;
};

const LifeExpectancyChart: React.FC<LifeExpectancyChartProps> = ({ data, className }) => {
  const animatedLifeExpectancy = useAnimatedNumber(
    data.adjustedLifeExpectancy,
    1500,
    easeOutCubic
  );
  
  const chartData = useMemo(() => {
    // Sort the impact factors by absolute value (most significant first)
    const impactItems = Object.entries(data.impactByFactor)
      .map(([key, impact]) => ({
        name: key,
        impact,
        color: impact > 0 ? 'text-health-positive' : impact < 0 ? 'text-health-negative' : 'text-health-neutral',
        fillColor: impact > 0 ? '#34D399' : impact < 0 ? '#FB7185' : '#94A3B8',
        description: getFactorDescription(key),
      }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
      
    return impactItems;
  }, [data.impactByFactor]);
  
  return (
    <div className={cn("bg-black/95 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 animate-scale-in shadow-lg", className)}>
      <div className="text-center mb-6">
        <span className="health-tag health-tag-neutral inline-block mb-2 bg-white/10 border-2 border-white/20">Life Expectancy</span>
        <h2 className="text-4xl font-bold tracking-tight text-white">
          {animatedLifeExpectancy.toFixed(1)} years
        </h2>
        <p className="text-white/70">
          {data.yearsGainedLost > 0 
            ? `+${data.yearsGainedLost.toFixed(1)} years from lifestyle factors` 
            : data.yearsGainedLost < 0 
              ? `${data.yearsGainedLost.toFixed(1)} years from lifestyle factors`
              : "Baseline expectancy for your profile"}
        </p>
      </div>
      
      <div className="pt-4">
        <h3 className="text-md font-medium mb-4 text-white">Impact of Lifestyle Factors</h3>
        <ResponsiveContainer width="100%" height={40 * chartData.length} className="mt-4">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <XAxis 
              type="number"
              domain={[-10, 10]}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}`}
              tick={{ fill: '#94A3B8' }}
              axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.2 }}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#94A3B8" strokeDasharray="3 3" strokeOpacity={0.3} />
            <YAxis 
              type="category" 
              dataKey="name" 
              tickLine={false}
              axisLine={{ stroke: '#94A3B8', strokeOpacity: 0.2 }}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(value) => {
                const names: Record<string, string> = {
                  smoking: "Smoking",
                  physicalActivity: "Physical Activity",
                  diet: "Diet",
                  alcohol: "Alcohol",
                  bmi: "BMI",
                  sleep: "Sleep",
                  stress: "Stress",
                  socialConnections: "Social Connections",
                  education: "Education"
                };
                return names[value] || value;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="impact" radius={[4, 4, 4, 4]} barSize={20} animationDuration={1200}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.fillColor}
                  fillOpacity={0.8}
                />
              ))}
              <LabelList 
                dataKey="impact" 
                position="right" 
                formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`}
                style={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-center pt-6">
        <span className="health-tag health-tag-neutral inline-block mb-2 bg-white/10 border-2 border-white/20">Years Remaining</span>
        <h3 className="text-2xl font-bold text-white">
          {data.totalYearsRemaining.toFixed(1)} years
        </h3>
        <p className="text-sm text-white/70">Based on your current age of {data.currentAge}</p>
      </div>
    </div>
  );
};

function getFactorDescription(factor: string): string {
  const descriptions: Record<string, string> = {
    smoking: "Impact of smoking habits on life expectancy",
    physicalActivity: "Impact of physical activity levels on life expectancy",
    diet: "Impact of dietary habits on life expectancy",
    alcohol: "Impact of alcohol consumption on life expectancy",
    bmi: "Impact of body mass index on life expectancy",
    sleep: "Impact of sleep habits on life expectancy",
    stress: "Impact of stress levels on life expectancy",
    socialConnections: "Impact of social relationships on life expectancy",
    education: "Impact of education level on life expectancy",
  };
  
  return descriptions[factor] || "Impact on life expectancy";
}

export default LifeExpectancyChart;
