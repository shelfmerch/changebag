import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import CauseSelectionStep from './wizard/CauseSelectionStep';
import ToteQuantityStep from './wizard/ToteQuantityStep';
import LogoUploadStep from './wizard/LogoUploadStep';
import DistributionInfoStep from './wizard/DistributionInfoStep';
import ConfirmationStep from './wizard/ConfirmationStep';
import axios from 'axios';

interface OnboardingWizardProps {
  initialCauseId?: string | null;
  onComplete: (formData: any) => void;
  isSubmitting: boolean;
  isWidget?: boolean;
  onStepChange?: (step: number) => void;
}

const OnboardingWizard = ({
  initialCauseId,
  onComplete,
  isSubmitting,
  isWidget = false,
  onStepChange
}: OnboardingWizardProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [causeData, setCauseData] = useState<any>(null);
  const [claimedTotes, setClaimedTotes] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'unverified' | 'verified'>('unverified');
  const [phoneStatus, setPhoneStatus] = useState<'unverified' | 'verified'>('unverified');
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    selectedCause: initialCauseId || '',
    causeTitle: '',
    toteQuantity: 50,
    unitPrice: 10, // Default unit price for 50 totes
    distributionType: 'online' as 'online' | 'physical', // Default to online distribution
    numberOfTotes: 50,
    logoUrl: '',
    message: '',
    distributionPoints: {} as {
      [city: string]: {
        malls: { name: string; totes: number; selected: boolean }[];
        parks: { name: string; totes: number; selected: boolean }[];
        theatres: { name: string; totes: number; selected: boolean }[];
        metroStations: { name: string; totes: number; selected: boolean }[];
        schools: { name: string; totes: number; selected: boolean }[];
      };
    },
    selectedCities: [] as string[],
    distributionStartDate: undefined,
    distributionEndDate: undefined,
    distributionDate: undefined,
    // Add fields for physical distribution
    distributionPointName: '',
    distributionPointAddress: '',
    distributionPointContact: '',
    distributionPointPhone: '',
    distributionPointLocation: '',
    // Add fields for physical distribution locations
    selectedMalls: [] as string[],
    selectedMetroStations: [] as string[],
    selectedAirports: [] as string[],
    selectedSchools: [] as string[],
    shippingAddress: '',
    shippingContactName: '',
    shippingPhone: '',
    shippingInstructions: '',
    demographics: {
      ageGroups: [],
      income: '',
      education: '',
      other: '',
    },
  });

  const handleFormUpdate = (data: Partial<any>) => {
    // If we're updating toteQuantity directly from ToteQuantityStep, update both quantity and unit price
    if (data.toteQuantity !== undefined && !data.distributionPoints && !data.distributionType) {
      setFormData(prev => ({
        ...prev,
        toteQuantity: data.toteQuantity,
        unitPrice: data.unitPrice || prev.unitPrice
      }));
      return;
    }

    // If we're changing distribution type, preserve the current tote quantity
    if (data.distributionType !== undefined) {
      const currentToteQuantity = formData.toteQuantity;
      setFormData(prev => ({
        ...prev,
        ...data,
        toteQuantity: currentToteQuantity // Preserve the user's selected quantity
      }));
      return;
    }

    // Handle distribution points updates without modifying tote quantity
    if (data.distributionPoints && formData.distributionType === 'physical') {
      setFormData(prev => ({
        ...prev,
        ...data,
        toteQuantity: prev.toteQuantity // Keep the existing tote quantity
      }));
      return;
    }

    // Default case: update the data while preserving tote quantity
    setFormData(prev => ({
      ...prev,
      ...data,
      toteQuantity: data.toteQuantity !== undefined ? data.toteQuantity : prev.toteQuantity
    }));
  };

  // Helper function to calculate total totes from distribution points data
  const calculateTotalTotesFromData = (distributionPoints: any) => {
    if (!distributionPoints || typeof distributionPoints !== 'object') {
      return 0;
    }

    let calculatedTotal = 0;
    Object.entries(distributionPoints).forEach(([city, categories]: [string, any]) => {
      Object.entries(categories).forEach(([category, points]: [string, any]) => {
        points.forEach((point: any) => {
          if (point.selected) {
            calculatedTotal += point.totes;
          }
        });
      });
    });

    return calculatedTotal || 50;
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    handleFormUpdate(data);

    // If the cause selection changes, fetch the new cause data
    if (data.selectedCause && data.selectedCause !== formData.selectedCause) {
      fetchCauseData(data.selectedCause);
    }
  };

  // Fetch cause data to get claimed totes information
  const fetchCauseData = async (causeId: string) => {
    if (!causeId) return;

    try {
      const response = await axios.get(`/api/causes/${causeId}`);
      setCauseData(response.data);
      setClaimedTotes(response.data.claimedTotes || 0);
      // Update formData with the cause title
      setFormData(prev => ({
        ...prev,
        causeTitle: response.data.title || response.data.name || 'Selected Cause'
      }));
    } catch (error) {
      console.error('Error fetching cause data:', error);
    }
  };

  // Fetch initial cause data if initialCauseId is provided
  useEffect(() => {
    if (initialCauseId) {
      fetchCauseData(initialCauseId);
    }
  }, [initialCauseId]);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: user.name || prev.contactName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      if (user.emailVerified) setEmailStatus('verified');
      if (user.phoneVerified) setPhoneStatus('verified');
    }
  }, [user]);

  /**
   * Calculate total totes based on distribution type and settings
   * 
   * For online distribution: Uses the numberOfTotes field or defaults to 50
   * For physical distribution: Calculates based on selected distribution points
   *   - Schools: 400 totes per location
   *   - Malls: 800 totes per location
   *   - Metro Stations: 800 totes per location
   *   - Airports: 1000 totes per location
   *   - Custom locations: 10 totes per location
   * 
   * @returns {number} The calculated total number of totes
   */
  const calculateTotalTotes = () => {
    // For online distribution, use the toteQuantity directly
    if (formData.distributionType === 'online') {
      return formData.toteQuantity || 50;
    }
    // For physical distribution, calculate based on selected distribution points
    else if (formData.distributionType === 'physical') {
      // Calculate total totes by summing up the count for each selected distribution point
      let calculatedTotal = 0;

      // Iterate through each city in the distributionPoints object
      if (formData.distributionPoints && typeof formData.distributionPoints === 'object') {
        Object.entries(formData.distributionPoints).forEach(([city, categories]: [string, any]) => {
          Object.entries(categories).forEach(([category, points]: [string, any]) => {
            points.forEach((point: any) => {
              if (point.selected) {
                calculatedTotal += point.totes;
              }
            });
          });
        });
      }

      // If no distribution points are selected, default to toteQuantity from form
      return calculatedTotal || formData.toteQuantity || 50;
    }

    // Default fallback value if no distribution type is selected
    return 50;
  };

  const totalSteps = 5; // Increased from 4 to 5
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Validate the current step before proceeding to the next step
  const validateCurrentStep = (): { isValid: boolean; message?: string } => {
    switch (currentStep) {
      case 1: // ToteQuantityStep
        if (formData.toteQuantity <= 0) {
          return { isValid: false, message: 'Tote quantity must be greater than 0' };
        }
        if (!formData.distributionType) {
          return { isValid: false, message: 'Please select a distribution type (online or physical)' };
        }
        return { isValid: true };

      case 2: // CauseSelectionStep
        if (!formData.selectedCause) {
          return { isValid: false, message: 'Please select a cause to sponsor' };
        }
        if (!formData.organizationName || formData.organizationName.trim() === '') {
          return { isValid: false, message: 'Organization name is required' };
        }
        if (!formData.contactName || formData.contactName.trim() === '') {
          return { isValid: false, message: 'Contact name is required' };
        }
        if (!formData.email || formData.email.trim() === '') {
          return { isValid: false, message: 'Email is required' };
        }
        if (!formData.phone || formData.phone.trim() === '') {
          return { isValid: false, message: 'Phone number is required' };
        }
        if (emailStatus !== 'verified') {
          return { isValid: false, message: 'Please verify your email address' };
        }
        if (phoneStatus !== 'verified') {
          return { isValid: false, message: 'Please verify your phone number' };
        }
        return { isValid: true };

      case 3: // LogoUploadStep
        if (!formData.logoUrl || formData.logoUrl.trim() === '') {
          return { isValid: false, message: 'Please upload your organization logo' };
        }
        return { isValid: true };

      case 4: // DistributionInfoStep
        // First check if distribution type is selected
        if (!formData.distributionType) {
          return { isValid: false, message: 'Please select a distribution type' };
        }

        // Validate based on the selected distribution type
        if (formData.distributionType === 'physical') {
          // For physical distribution, check if at least one distribution point is selected
          const hasSelectedPoints = Object.values(formData.distributionPoints || {}).some((city: any) =>
            Object.values(city).some((category: any) =>
              category.some((point: any) => point.selected)
            )
          );

          if (!hasSelectedPoints) {
            return { isValid: false, message: 'Please select at least one distribution point' };
          }

          if (!formData.distributionStartDate || !formData.distributionEndDate) {
            return { isValid: false, message: 'Please specify distribution start and end dates' };
          }

          // Ensure all totes are distributed across selected points
          let distributedTotal = 0;
          if (formData.distributionPoints && typeof formData.distributionPoints === 'object') {
            Object.values(formData.distributionPoints).forEach((city: any) => {
              Object.values(city).forEach((category: any) => {
                category.forEach((point: any) => {
                  if (point.selected) {
                    distributedTotal += Number(point.totes) || 0;
                  }
                });
              });
            });
          }

          const expectedTotal = Number(formData.toteQuantity) || 0;
          if (distributedTotal !== expectedTotal) {
            return {
              isValid: false,
              message: `Please allocate all totes. Assigned ${distributedTotal.toLocaleString()} of ${expectedTotal.toLocaleString()}.`
            };
          }
        } else if (formData.distributionType === 'online') {
          // For online distribution, only validate campaign dates
          if (!formData.distributionStartDate || !formData.distributionEndDate) {
            return { isValid: false, message: 'Please specify campaign start and end dates' };
          }
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  };

  const nextStep = () => {
    // Clear any existing validation errors
    setValidationError(null);

    const validation = validateCurrentStep();
    if (validation.isValid) {
      const newStep = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(newStep);
      // Notify parent component of step change (for widget mode)
      onStepChange?.(newStep);
    } else {
      // Set the validation error message to be displayed inline
      setValidationError(validation.message || 'Please complete all required fields before continuing');
    }
  };
  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    onStepChange?.(newStep);
  };

  // Calculate the unit price and total amount
  const calculatePricing = () => {
    // Calculate unit price based on quantity tiers (same logic as ToteQuantityStep)
    const getUnitPrice = (quantity: number): number => {
      if (quantity >= 50000) return 35.01; // ₹5 per tote for 7000+ totes
      if (quantity >= 40000) return 39.55; // ₹5 per tote for 7000+ totes
      if (quantity >= 30000) return 44.09; // ₹5 per tote for 7000+ totes
      if (quantity >= 20000) return 48.64; // ₹5 per tote for 7000+ totes
      if (quantity >= 10000) return 53.18; // ₹5 per tote for 7000+ totes
      if (quantity >= 5000) return 57.73; // ₹5 per tote for 7000+ totes
      if (quantity >= 2500) return 62.27; // ₹5 per tote for 7000+ totes
      if (quantity >= 1000) return 66.82; // ₹5 per tote for 7000+ totes
      if (quantity >= 500) return 71.36; // ₹5 per tote for 7000+ totes
      if (quantity >= 250) return 75.91; // ₹7 per tote for 5000-6999 totes
      if (quantity >= 100) return 80.45; // ₹8 per tote for 1000-4999 totes
      if (quantity >= 50) return 85;  // ₹9 per tote for 500-999 totes
      return 85;
    };

    const toteQuantity = calculateTotalTotes();
    // Use stored unit price if available, otherwise calculate it
    const unitPrice = formData.unitPrice || getUnitPrice(toteQuantity);
    const totalAmount = unitPrice * toteQuantity;

    console.log(`OnboardingWizard calculatePricing: Quantity=${toteQuantity}, UnitPrice=₹${unitPrice}, TotalAmount=₹${totalAmount}`);

    return {
      unitPrice,
      totalAmount,
      toteQuantity
    };
  };

  const handleSubmit = () => {
    // Calculate pricing information
    const { unitPrice, totalAmount, toteQuantity } = calculatePricing();

    // Transform distributionPoints from array to the expected format for the API
    let transformedDistributionPoints = [];

    // If using physical distribution, transform the distribution points data structure
    if (formData.distributionType === 'physical' && formData.distributionPoints) {
      // Convert the complex city-based structure to a flat array of distribution points
      // as expected by the Sponsorship model
      if (Array.isArray(formData.distributionPoints)) {
        // If it's already an array, use it directly
        transformedDistributionPoints = formData.distributionPoints;
      } else {
        // If it's the city-based object structure from DistributionInfoStep
        // Extract distribution locations and convert to the format expected by the API
        Object.entries(formData.distributionPoints).forEach(([city, locations]) => {
          Object.entries(locations).forEach(([locationType, points]) => {
            points.forEach(point => {
              if (point.selected) {
                transformedDistributionPoints.push({
                  name: point.name,
                  address: `${city}, India`,
                  contactPerson: formData.contactName,
                  phone: formData.phone,
                  location: city,
                  totesCount: point.totes
                });
              }
            });
          });
        });
      }
    }

    // Use the calculated values in the form submission
    onComplete({
      ...formData,
      toteQuantity,
      unitPrice,
      totalAmount,
      distributionPoints: transformedDistributionPoints
    });
  };

  // Handle payment completion from ConfirmationStep
  const handlePaymentComplete = (paymentId?: string) => {
    // Calculate pricing information
    const { unitPrice, totalAmount, toteQuantity } = calculatePricing();

    // Transform distributionPoints from array to the expected format for the API
    let transformedDistributionPoints = [];

    // If using physical distribution, transform the distribution points data structure
    if (formData.distributionType === 'physical' && formData.distributionPoints) {
      // Convert the complex city-based structure to a flat array of distribution points
      // as expected by the Sponsorship model
      if (Array.isArray(formData.distributionPoints)) {
        // If it's already an array, use it directly
        transformedDistributionPoints = formData.distributionPoints;
      } else {
        // If it's the city-based object structure from DistributionInfoStep
        // Extract distribution locations and convert to the format expected by the API
        Object.entries(formData.distributionPoints).forEach(([city, locations]) => {
          Object.entries(locations).forEach(([locationType, points]) => {
            points.forEach(point => {
              if (point.selected) {
                transformedDistributionPoints.push({
                  name: point.name,
                  address: `${city}, India`,
                  contactPerson: formData.contactName,
                  phone: formData.phone,
                  location: city,
                  totesCount: point.totes
                });
              }
            });
          });
        });
      }
    }

    // Use the calculated values in the form submission with payment ID
    onComplete({
      ...formData,
      toteQuantity,
      unitPrice,
      totalAmount,
      distributionPoints: transformedDistributionPoints,
      paymentId: paymentId
    });
  };

  return (
    <div className={isWidget ? 'widget-mode' : ''}>
      <div className={isWidget ? 'mb-4' : 'mb-8'}>
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {currentStep === 1 && (
        <ToteQuantityStep
          formData={{
            ...formData,
            // Ensure toteQuantity is synced with distribution points for physical distribution
            toteQuantity: formData.distributionType === 'physical' ?
              calculateTotalTotes() : formData.toteQuantity,
            // Include the current unit price
            unitPrice: formData.unitPrice
          }}
          updateFormData={handleFormUpdate}
          validationError={validationError}
        />
      )}

      {currentStep === 2 && (
        <CauseSelectionStep
          formData={formData}
          updateFormData={updateFormData}
          causeData={causeData}
          validationError={validationError}
          emailStatus={emailStatus}
          phoneStatus={phoneStatus}
          setEmailStatus={setEmailStatus}
          setPhoneStatus={setPhoneStatus}
        />
      )}

      {currentStep === 3 && (
        <LogoUploadStep
          formData={formData}
          updateFormData={updateFormData}
          validationError={validationError}
        />
      )}

      {currentStep === 4 && (
        <DistributionInfoStep
          formData={formData}
          updateFormData={updateFormData}
          validationError={validationError}
          goToStep={(step) => setCurrentStep(step)}
        />
      )}

      {currentStep === 5 && (
        <ConfirmationStep
          formData={{
            ...formData,
            ...calculatePricing(),
            availableTotes: Math.max(0, calculateTotalTotes() - claimedTotes),
            claimedTotes: claimedTotes,
            // Ensure distribution type is passed
            distributionType: formData.distributionType,
            // Pass appropriate dates based on distribution type
            distributionStartDate: formData.distributionType === 'physical' ? formData.distributionStartDate : undefined,
            distributionEndDate: formData.distributionType === 'physical' ? formData.distributionEndDate : undefined,
            distributionDate: formData.distributionType === 'online' ? formData.distributionDate : undefined,
            // Transform distributionPoints to string array for ConfirmationStep
            distributionPoints: (() => {
              if (!formData.distributionPoints || typeof formData.distributionPoints !== 'object') {
                return [];
              }

              const points: string[] = [];

              // Convert the complex structure to a simple string array
              Object.entries(formData.distributionPoints).forEach(([city, categories]) => {
                Object.entries(categories).forEach(([categoryName, locationsList]) => {
                  locationsList.forEach(location => {
                    if (location.selected) {
                      points.push(`${location.name} (${city}) - ${location.totes} totes`);
                    }
                  });
                });
              });

              return points;
            })()
          }}
          causeData={causeData}
          onComplete={handlePaymentComplete}
        />
      )}

      <div className={`flex justify-between ${isWidget ? 'mt-4 pt-3' : 'mt-8 pt-4'} border-t`}>
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          size={isWidget ? 'sm' : 'default'}
        >
          Back
        </Button>

        {currentStep < totalSteps && (
          <Button
            onClick={nextStep}
            size={isWidget ? 'sm' : 'default'}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
