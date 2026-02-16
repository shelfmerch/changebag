import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';

interface CauseSelectionStepProps {
  formData: {
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    selectedCause: string;
  };
  updateFormData: (data: Partial<{
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    selectedCause: string;
  }>) => void;
  causeData?: any; // Make causeData optional
  validationError: string | null;
}

const CauseSelectionStep = ({ formData, updateFormData, causeData, validationError }: CauseSelectionStepProps) => {
  // Mock causes data (would fetch from API)
  const causes = [
    { id: '1', title: 'Clean Water Initiative' },
    { id: '2', title: "Children's Education Fund" },
    { id: '3', title: 'Women Entrepreneurs' },
    { id: '4', title: 'Wildlife Conservation' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSelectChange = (value: string) => {
    updateFormData({ selectedCause: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Organization Details</h2>
      
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {validationError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            className={validationError && !formData.organizationName ? "border-red-500" : ""}
          />
          {validationError && !formData.organizationName && (
            <p className="text-red-500 text-sm mt-1">Organization name is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            required
            className={validationError && !formData.contactName ? "border-red-500" : ""}
          />
          {validationError && !formData.contactName && (
            <p className="text-red-500 text-sm mt-1">Contact name is required</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={validationError && !formData.email ? "border-red-500" : ""}
          />
          {validationError && !formData.email && (
            <p className="text-red-500 text-sm mt-1">Email is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className={validationError && !formData.phone ? "border-red-500" : ""}
          />
          {validationError && !formData.phone && (
            <p className="text-red-500 text-sm mt-1">Phone number is required</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CauseSelectionStep;
