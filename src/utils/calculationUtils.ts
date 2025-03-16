
// Base life expectancy data (average in years) - based on CDC data
const BASE_LIFE_EXPECTANCY = {
  male: 76.1,
  female: 81.1,
};

// Impact factors based on scientific studies
// Values in years (positive values extend life, negative values reduce it)
export const LIFESTYLE_IMPACTS = {
  smoking: {
    current: -10, // heavy smokers lose ~10 years on average
    former: -5, // former smokers partially recover but still have reduced expectancy
    never: 0, // baseline
  },
  physicalActivity: {
    high: 4.5, // regular vigorous activity adds ~4.5 years
    medium: 2.5, // moderate regular activity
    low: 0, // little to no regular activity (baseline)
    sedentary: -3.5, // sedentary lifestyle reduces lifespan
  },
  diet: {
    excellent: 5, // optimal diet rich in fruits, vegetables, whole grains
    good: 2.5, // generally healthy diet
    average: 0, // typical western diet (baseline)
    poor: -2.5, // poor diet high in processed foods and sugars
  },
  alcohol: {
    none: 0, // baseline
    moderate: -0.5, // 1-2 drinks per day
    heavy: -5, // heavy drinking significantly reduces lifespan
  },
  bmi: {
    healthy: 0, // BMI 18.5-24.9 (baseline)
    overweight: -1, // BMI 25-29.9
    obese: -4, // BMI 30+
    underweight: -2, // BMI < 18.5
  },
  sleep: {
    optimal: 1.5, // 7-8 hours consistently
    adequate: 0, // 6-7 hours (baseline)
    insufficient: -2, // less than 6 hours regularly
    excessive: -1, // more than 9 hours regularly
  },
  stress: {
    low: 1.5, // minimal chronic stress
    average: 0, // moderate stress (baseline)
    high: -2.5, // high chronic stress
  },
  socialConnections: {
    strong: 5, // strong social network and regular connections
    moderate: 2, // some social connections
    weak: 0, // few social connections (baseline)
    isolated: -5, // social isolation
  },
  education: {
    advanced: 2, // advanced degree
    college: 1, // college education
    highSchool: 0, // high school education (baseline)
    lessThanHighSchool: -1, // less than high school
  },
};

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  smoking: keyof typeof LIFESTYLE_IMPACTS.smoking;
  physicalActivity: keyof typeof LIFESTYLE_IMPACTS.physicalActivity;
  diet: keyof typeof LIFESTYLE_IMPACTS.diet;
  alcohol: keyof typeof LIFESTYLE_IMPACTS.alcohol;
  bmi: keyof typeof LIFESTYLE_IMPACTS.bmi;
  sleep: keyof typeof LIFESTYLE_IMPACTS.sleep;
  stress: keyof typeof LIFESTYLE_IMPACTS.stress;
  socialConnections: keyof typeof LIFESTYLE_IMPACTS.socialConnections;
  education: keyof typeof LIFESTYLE_IMPACTS.education;
}

export interface LifeExpectancyResult {
  currentAge: number;
  baseLifeExpectancy: number;
  adjustedLifeExpectancy: number;
  yearsGainedLost: number;
  impactByFactor: Record<string, number>;
  totalYearsRemaining: number;
}

export const calculateLifeExpectancy = (profile: UserProfile): LifeExpectancyResult => {
  // Get base life expectancy by gender
  const baseLifeExpectancy = BASE_LIFE_EXPECTANCY[profile.gender];
  
  // Calculate impact from each factor
  const impactByFactor: Record<string, number> = {
    smoking: LIFESTYLE_IMPACTS.smoking[profile.smoking],
    physicalActivity: LIFESTYLE_IMPACTS.physicalActivity[profile.physicalActivity],
    diet: LIFESTYLE_IMPACTS.diet[profile.diet],
    alcohol: LIFESTYLE_IMPACTS.alcohol[profile.alcohol],
    bmi: LIFESTYLE_IMPACTS.bmi[profile.bmi],
    sleep: LIFESTYLE_IMPACTS.sleep[profile.sleep],
    stress: LIFESTYLE_IMPACTS.stress[profile.stress],
    socialConnections: LIFESTYLE_IMPACTS.socialConnections[profile.socialConnections],
    education: LIFESTYLE_IMPACTS.education[profile.education],
  };
  
  // Sum up all impacts
  const totalImpact = Object.values(impactByFactor).reduce((sum, value) => sum + value, 0);
  
  // Calculate adjusted life expectancy
  const adjustedLifeExpectancy = baseLifeExpectancy + totalImpact;
  
  // Calculate years remaining
  const totalYearsRemaining = adjustedLifeExpectancy - profile.age;
  
  return {
    currentAge: profile.age,
    baseLifeExpectancy,
    adjustedLifeExpectancy,
    yearsGainedLost: totalImpact,
    impactByFactor,
    totalYearsRemaining: Math.max(0, totalYearsRemaining), // Can't be negative
  };
};

export const getDefaultProfile = (age: number = 30, gender: 'male' | 'female' = 'male'): UserProfile => ({
  age,
  gender,
  smoking: 'never',
  physicalActivity: 'medium',
  diet: 'average',
  alcohol: 'moderate',
  bmi: 'healthy',
  sleep: 'adequate',
  stress: 'average',
  socialConnections: 'moderate',
  education: 'college',
});

export const getModifiedProfile = (
  originalProfile: UserProfile,
  modifications: Partial<UserProfile>
): UserProfile => ({
  ...originalProfile,
  ...modifications,
});

export const calculateComparisonData = (
  originalProfile: UserProfile,
  modifiedProfile: UserProfile
): {
  original: LifeExpectancyResult;
  modified: LifeExpectancyResult;
  difference: number;
} => {
  const originalResult = calculateLifeExpectancy(originalProfile);
  const modifiedResult = calculateLifeExpectancy(modifiedProfile);
  
  return {
    original: originalResult,
    modified: modifiedResult,
    difference: modifiedResult.adjustedLifeExpectancy - originalResult.adjustedLifeExpectancy,
  };
};

export const formatDecimal = (value: number): string => {
  return value.toFixed(1);
};

export const getFactorName = (factor: string): string => {
  const names: Record<string, string> = {
    smoking: "Smoking",
    physicalActivity: "Physical Activity",
    diet: "Diet",
    alcohol: "Alcohol Consumption",
    bmi: "BMI",
    sleep: "Sleep",
    stress: "Stress Levels",
    socialConnections: "Social Connections",
    education: "Education Level",
  };
  
  return names[factor] || factor;
};

export const getFactorChoiceName = (factor: string, choice: string): string => {
  // Custom human-readable names for each choice
  const choiceNames: Record<string, Record<string, string>> = {
    smoking: {
      current: "Current Smoker",
      former: "Former Smoker",
      never: "Never Smoked",
    },
    physicalActivity: {
      high: "Very Active",
      medium: "Moderately Active",
      low: "Minimal Activity",
      sedentary: "Sedentary",
    },
    diet: {
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      poor: "Poor",
    },
    alcohol: {
      none: "None",
      moderate: "Moderate",
      heavy: "Heavy",
    },
    bmi: {
      healthy: "Healthy (18.5-24.9)",
      overweight: "Overweight (25-29.9)",
      obese: "Obese (30+)",
      underweight: "Underweight (<18.5)",
    },
    sleep: {
      optimal: "Optimal (7-8 hrs)",
      adequate: "Adequate (6-7 hrs)",
      insufficient: "Insufficient (<6 hrs)",
      excessive: "Excessive (>9 hrs)",
    },
    stress: {
      low: "Low",
      average: "Average",
      high: "High",
    },
    socialConnections: {
      strong: "Strong",
      moderate: "Moderate",
      weak: "Weak",
      isolated: "Isolated",
    },
    education: {
      advanced: "Advanced Degree",
      college: "College",
      highSchool: "High School",
      lessThanHighSchool: "Less than High School",
    },
  };
  
  return choiceNames[factor]?.[choice] || choice;
};

export const getImpactColor = (impact: number): string => {
  if (impact > 0) return 'health-positive';
  if (impact < 0) return 'health-negative';
  return 'health-neutral';
};

export const getFactorOptions = (factor: string): { value: string; label: string }[] => {
  const factorKey = factor as keyof typeof LIFESTYLE_IMPACTS;
  
  if (LIFESTYLE_IMPACTS[factorKey]) {
    return Object.keys(LIFESTYLE_IMPACTS[factorKey]).map(choice => ({
      value: choice,
      label: getFactorChoiceName(factor, choice),
    }));
  }
  
  return [];
};
