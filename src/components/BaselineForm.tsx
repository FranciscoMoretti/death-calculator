
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/utils/calculationUtils';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, UserIcon } from 'lucide-react';

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
    <div className={cn("form-section", className)}>
      <h2 className="text-xl font-semibold tracking-tight mb-6">Tell us about yourself</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-muted">
                <CalendarIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <Label htmlFor="age" className="text-base font-medium mb-2 block">How old are you?</Label>
                <p className="text-sm text-muted-foreground mb-4">Your current age helps establish your baseline life expectancy</p>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={120}
                  value={profile.age}
                  onChange={handleAgeChange}
                  className="max-w-[150px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-muted">
                <UserIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium mb-2 block">Select your biological sex</Label>
                <p className="text-sm text-muted-foreground mb-4">Biological sex is used for baseline calculations as it affects average life expectancy</p>
                
                <RadioGroup 
                  value={profile.gender}
                  onValueChange={(value) => handleGenderChange(value as 'male' | 'female')}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male" className="cursor-pointer flex-1">Male</Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female" className="cursor-pointer flex-1">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>* Based on average life expectancy data for your demographic</p>
      </div>
    </div>
  );
};

export default BaselineForm;
