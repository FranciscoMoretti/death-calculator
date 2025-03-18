
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/utils/calculationUtils';

interface BaselineFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  className?: string;
}

const BaselineForm: React.FC<BaselineFormProps> = ({ 
  profile, 
  onChange,
  className 
}) => {
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value);
    if (!isNaN(age) && age >= 0 && age <= 120) {
      onChange({ ...profile, age });
    }
  };
  
  const handleGenderChange = (value: 'male' | 'female') => {
    onChange({ ...profile, gender: value });
  };
  
  return (
    <div className={cn("form-section w-full", className)}>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Basic Information</h2>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="age" className="text-base">Current Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={profile.age}
            onChange={handleAgeChange}
            className="w-full max-w-[150px]"
          />
        </div>
        
        <div className="space-y-3">
          <Label className="text-base">Gender</Label>
          <RadioGroup 
            value={profile.gender}
            onValueChange={(value) => handleGenderChange(value as 'male' | 'female')}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male" className="cursor-pointer">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female" className="cursor-pointer">Female</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>* Gender is used for baseline calculations only, as biological factors affect average life expectancy</p>
      </div>
    </div>
  );
};

export default BaselineForm;
