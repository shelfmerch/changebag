import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import NumberInputWithSlider from '@/components/ui/number-input-with-slider';
import { useToast } from '@/hooks/use-toast';

interface ToteQuantityStepProps {
  formData: {
    toteQuantity: number;
    unitPrice?: number;
  };
  updateFormData: (data: Partial<{
    toteQuantity: number;
    unitPrice?: number;
  }>) => void;
  validationError: string | null;
}

const ToteQuantityStep = ({ formData, updateFormData, validationError }: ToteQuantityStepProps) => {
  const { toast } = useToast();
  // Calculate unit price based on quantity tiers
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

  // Use stored unit price if available, otherwise calculate it
  const unitPrice = getUnitPrice(formData.toteQuantity);
  const totalPrice = formData.toteQuantity * unitPrice;

  const impactStatistics = {
    trees: Math.round(formData.toteQuantity * 0.0125),
    plastic: Math.round(formData.toteQuantity * 0.55),
    carbon: Math.round(formData.toteQuantity * 0.16)
  };

  const handleQuantityChange = (newQuantity: number) => {
    const newUnitPrice = getUnitPrice(newQuantity);
    console.log(`ToteQuantityStep: Quantity changed to ${newQuantity}, unit price calculated as ₹${newUnitPrice}`);
    updateFormData({ 
      toteQuantity: newQuantity,
      unitPrice: newUnitPrice
    });
  };

  // Show validation error via toast instead of large inline banner
  useEffect(() => {
    if (validationError) {
      toast({
        title: 'Validation error',
        description: validationError,
        variant: 'destructive',
      });
    }
  }, [validationError, toast]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Tote Quantity</h2>
      
      {/* Validation errors are shown via toast; no large inline banner here */}
      
      <p className="text-gray-600 mb-6">
        Select the quantity of totes you'd like to sponsor. Use the slider for quick selection up to 10,000 totes, 
        or enter a custom value manually up to 100,000 totes. The unit price decreases as quantity increases.
      </p>
    
      <div className="space-y-6">
        {/* Number Input with Slider */}
        <NumberInputWithSlider
          value={formData.toteQuantity}
          onChange={handleQuantityChange}
          min={50}
          sliderMax={10000}
          inputMax={100000}
          step={50}
          label="Number of Totes"
          placeholder="Enter tote quantity"
        />

        {/* Price Display */}
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Pricing Summary</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-700">₹{totalPrice.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Unit Price</div>
                <div className="text-xl font-semibold text-gray-900">₹{unitPrice}/tote</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Quantity</div>
                <div className="text-xl font-semibold text-gray-900">{formData.toteQuantity.toLocaleString()} totes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Impact Statistics */}
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">Estimated Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-primary-700">{impactStatistics.trees}</p>
                <p className="text-sm text-gray-600">Trees saved</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-primary-700">{impactStatistics.plastic}kg</p>
                <p className="text-sm text-gray-600">Plastic reduced</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-primary-700">{impactStatistics.carbon}kg</p>
                <p className="text-sm text-gray-600">CO2 emissions avoided</p>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> The final price will be calculated based on the quantity and your selected cause.
            You'll review the full details in the confirmation step.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default ToteQuantityStep;
