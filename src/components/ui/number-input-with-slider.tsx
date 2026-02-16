import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface NumberInputWithSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  sliderMax?: number;
  inputMax?: number;
  step?: number;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

const NumberInputWithSlider: React.FC<NumberInputWithSliderProps> = ({
  value,
  onChange,
  min = 0,
  sliderMax = 10000,
  inputMax = 100000,
  step = 1,
  label,
  placeholder,
  className = '',
  disabled = false,
  showValidation = true
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateInput = (input: string): { isValid: boolean; message: string; numericValue: number } => {
    const numValue = parseInt(input);
    
    if (input === '' || isNaN(numValue)) {
      return { isValid: false, message: 'Please enter a valid number', numericValue: 0 };
    }
    
    if (numValue < min) {
      return { isValid: false, message: `Value must be at least ${min}`, numericValue: numValue };
    }
    
    if (numValue > inputMax) {
      return { isValid: false, message: `Value cannot exceed ${inputMax.toLocaleString()}`, numericValue: numValue };
    }
    
    return { isValid: true, message: '', numericValue: numValue };
  };

  const handleSliderChange = (newValue: number[]) => {
    const sliderValue = newValue[0];
    onChange(sliderValue);
    setInputValue(sliderValue.toString());
    setIsValid(true);
    setValidationMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    
    const validation = validateInput(newInputValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
    
    // Only update the actual value if input is valid and within slider range
    if (validation.isValid) {
      onChange(validation.numericValue);
    }
  };

  const handleInputBlur = () => {
    const validation = validateInput(inputValue);
    
    if (!validation.isValid) {
      // Reset to current value if invalid
      setInputValue(value.toString());
      setIsValid(true);
      setValidationMessage('');
    } else {
      // Clamp to input max if necessary
      const clampedValue = Math.min(validation.numericValue, inputMax);
      if (clampedValue !== validation.numericValue) {
        setInputValue(clampedValue.toString());
        onChange(clampedValue);
      }
    }
  };

  // Calculate slider value (clamped to slider max)
  const sliderValue = Math.min(value, sliderMax);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      
      <div className="space-y-4">
        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Slider Range</span>
            <span className="text-sm text-gray-500">
              {min.toLocaleString()} - {sliderMax.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[sliderValue]}
            min={min}
            max={sliderMax}
            step={step}
            onValueChange={handleSliderChange}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{min.toLocaleString()}</span>
            <span>{sliderMax.toLocaleString()}</span>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Manual Input</span>
            {/* <span className="text-sm text-gray-500">
              Up to {inputMax.toLocaleString()}
            </span> */}
          </div>
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={inputMax}
            step={step}
            placeholder={placeholder || `Enter value (${min} - ${inputMax.toLocaleString()})`}
            disabled={disabled}
            className={`${!isValid && showValidation ? 'border-red-300 focus:border-red-500' : ''}`}
          />
          
          {/* Validation Message */}
          {!isValid && showValidation && validationMessage && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{validationMessage}</span>
            </div>
          )}
        </div>

        {/* Current Value Display */}
        {/* <div className="bg-gray-50 rounded-md p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Current Value:</span>
            <span className="text-lg font-semibold text-gray-900">
              {value.toLocaleString()}
            </span>
          </div>
          {value > sliderMax && (
            <div className="mt-1 text-xs text-amber-600">
              ⚠️ Value exceeds slider range ({sliderMax.toLocaleString()})
            </div>
          )}
        </div> */}

        {/* Limits Explanation */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-xs text-blue-800 space-y-1">
            <div className="font-medium">Limits:</div>
            <div>• Slider: {min.toLocaleString()} - {sliderMax.toLocaleString()}</div>
            <div>• Manual Input: {min.toLocaleString()} - {inputMax.toLocaleString()}</div>
            <div>• Values above {sliderMax.toLocaleString()} can be entered manually but won't affect the slider</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default NumberInputWithSlider; 