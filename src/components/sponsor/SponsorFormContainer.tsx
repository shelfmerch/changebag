import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import OnboardingWizard from './OnboardingWizard';
import SponsorBenefits from './SponsorBenefits';
import axios from 'axios';
import config from '@/config';

interface SponsorFormContainerProps {
  causeId: string | null;
}

const SponsorFormContainer: React.FC<SponsorFormContainerProps> = ({ causeId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmitComplete = async (formData: any) => {
    setIsLoading(true);
    
    try {
      // Log the form data to verify tote quantity and pricing information is correct
      console.log('Submitting sponsorship with tote quantity:', formData.toteQuantity);
      console.log('Unit price:', formData.unitPrice);
      console.log('Total amount:', formData.totalAmount);
      console.log('Distribution type selected:', formData.distributionType);
      console.log('Payment ID:', formData.paymentId);
      
      // Create a copy of the data without the large logo URL to reduce payload size
      const logoUrl = formData.logoUrl;
      const submissionData = { ...formData };
      
      // Store just a reference to having a logo, not the full data URL
      if (logoUrl && logoUrl.startsWith('data:')) {
        // Replace the data URL with a flag indicating we have a logo
        submissionData.logoUrl = 'logo_uploaded_client_side';
        console.log('Removed large logo data URL from submission payload');
      }
      
      // Generate QR code URL for this sponsorship
      const qrCodeUrl = `${window.location.origin}/claim/${causeId}?source=qr&ref=sponsor-form&sponsor=${encodeURIComponent(formData.organizationName)}`;
      submissionData.qrCodeUrl = qrCodeUrl;
      
      console.log('Submitting data with size:', JSON.stringify(submissionData).length, 'bytes');
      console.log('QR Code URL:', qrCodeUrl);
      
      // Send data to the server using config.apiUrl to ensure consistency
      // This will properly handle both development and production environments
      const apiEndpoint = `${config.apiUrl}/sponsorships`;
      console.log('Sending sponsorship to endpoint:', apiEndpoint);
      
      // Add additional debugging for API URL
      console.log('Config API URL:', config.apiUrl);
      
      // Log the original distribution type from the form
      console.log('Original distribution type from form:', submissionData.distributionType);
      
      // Determine if this is a physical or online distribution
      // Force the value to be a string to avoid type comparison issues
      const distributionType = String(submissionData.distributionType).toLowerCase();
      const isPhysicalDistribution = distributionType === 'physical';
      
      console.log('Is physical distribution?', isPhysicalDistribution);
      
      // Prepare the complete payload with all required fields
      const payload = {
        ...submissionData,
        cause: causeId,
        // Explicitly set the distribution type based on the form selection
        distributionType: isPhysicalDistribution ? 'physical' : 'online',
        // Include payment information if available
        paymentId: submissionData.paymentId,
        paymentStatus: submissionData.paymentId ? 'completed' : 'pending',
        // Set distribution points based on type
        distributionPoints: isPhysicalDistribution
          ? [{ 
              name: submissionData.distributionPointName || 'Physical Location',
              address: submissionData.distributionPointAddress || 'To be determined',
              contactPerson: submissionData.distributionPointContact || submissionData.contactName,
              phone: submissionData.distributionPointPhone || submissionData.phone,
              totesCount: submissionData.toteQuantity || 0,
              location: submissionData.distributionPointLocation || ''
            }]
          : [{ 
              name: 'Online', 
              address: 'N/A', 
              contactPerson: 'N/A', 
              phone: 'N/A' 
            }]
      };
      
      // Add physical distribution details if applicable
      if (isPhysicalDistribution) {
        // Create distribution locations array based on selected locations
        const distributionLocations = [];
        
        // Process selected malls
        if (submissionData.selectedMalls && submissionData.selectedMalls.length > 0) {
          for (const mall of submissionData.selectedMalls) {
            distributionLocations.push({
              name: mall,
              type: 'mall',
              totesCount: Math.ceil(submissionData.toteQuantity / (submissionData.selectedMalls.length || 1))
            });
          }
        }
        
        // Process selected metro stations
        if (submissionData.selectedMetroStations && submissionData.selectedMetroStations.length > 0) {
          for (const station of submissionData.selectedMetroStations) {
            distributionLocations.push({
              name: station,
              type: 'metro_station',
              totesCount: Math.ceil(submissionData.toteQuantity / (submissionData.selectedMetroStations.length || 1))
            });
          }
        }
        
        // Process selected airports
        if (submissionData.selectedAirports && submissionData.selectedAirports.length > 0) {
          for (const airport of submissionData.selectedAirports) {
            distributionLocations.push({
              name: airport,
              type: 'airport',
              totesCount: Math.ceil(submissionData.toteQuantity / (submissionData.selectedAirports.length || 1))
            });
          }
        }
        
        // Process selected schools
        if (submissionData.selectedSchools && submissionData.selectedSchools.length > 0) {
          for (const school of submissionData.selectedSchools) {
            distributionLocations.push({
              name: school,
              type: 'school',
              totesCount: Math.ceil(submissionData.toteQuantity / (submissionData.selectedSchools.length || 1))
            });
          }
        }
        
        // Add custom distribution points if any
        const customPoints = submissionData.distributionPoints.filter(point => 
          !submissionData.selectedMalls?.includes(point) && 
          !submissionData.selectedMetroStations?.includes(point) && 
          !submissionData.selectedAirports?.includes(point) && 
          !submissionData.selectedSchools?.includes(point)
        );
        
        for (const customPoint of customPoints) {
          distributionLocations.push({
            name: customPoint,
            type: 'other',
            totesCount: Math.ceil(submissionData.toteQuantity / (customPoints.length || 1))
          });
        }
        
        // Log the distribution locations for debugging
        console.log('Distribution locations:', distributionLocations);
        
        payload.physicalDistributionDetails = {
          shippingAddress: submissionData.shippingAddress || '',
          shippingContactName: submissionData.shippingContactName || submissionData.contactName,
          shippingPhone: submissionData.shippingPhone || submissionData.phone,
          shippingInstructions: submissionData.shippingInstructions || '',
          distributionLocations: distributionLocations
        };
      }
      
      // Log the complete payload for debugging
      console.log('Sending complete payload:', JSON.stringify(payload, null, 2));
      
      // Log the exact URL being used for debugging
      console.log('Full API URL being used:', apiEndpoint);
      
      let responseData;
      
      // Try the request with more detailed error handling
      try {
        // Use axios with explicit configuration to handle potential CORS issues
        const response = await axios.post(apiEndpoint, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
          },
          withCredentials: true
        });
        
        responseData = response.data;
        console.log('Sponsorship created successfully with ID:', responseData._id);
        console.log('Server response:', responseData);
      } catch (requestError: any) {
        // Log detailed error information
        console.error('Detailed request error:', {
          status: requestError.response?.status,
          statusText: requestError.response?.statusText,
          data: requestError.response?.data,
          headers: requestError.response?.headers,
          config: requestError.config
        });
        
        // If we get a 405 Method Not Allowed error, try an alternative endpoint format
        if (requestError.response?.status === 405) {
          console.log('Received 405 error, trying alternative endpoint format...');
          
          // Try with a different endpoint format (without /api prefix)
          const altEndpoint = apiEndpoint.replace('/sponsorships', '/sponsorships');
          console.log('Trying alternative endpoint:', altEndpoint);
          
          try {
            const altResponse = await axios.post(altEndpoint, payload, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
              },
              withCredentials: true
            });
            
            responseData = altResponse.data;
            console.log('Sponsorship created successfully with alternative endpoint, ID:', responseData._id);
            console.log('Server response from alternative endpoint:', responseData);
          } catch (altError) {
            console.error('Alternative endpoint also failed:', altError);
            throw altError;
          }
        } else {
          // Re-throw the error if it's not a 405
          throw requestError;
        }
      }
      
      // If we got here, we have a successful response
      toast({
        title: "Sponsorship Request Submitted",
        description: "Thank you for your sponsorship! We'll review your request and get back to you soon.",
      });
      
      // Navigate to a confirmation page instead of dashboard
      navigate('/sponsorship/confirmation', { 
        state: { sponsorshipId: responseData._id } 
      });
    } catch (error: any) {
      console.error('Error submitting sponsorship:', error);
      toast({
        title: "Submission Error",
        description: error.response?.data?.message || "There was a problem submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <OnboardingWizard 
                initialCauseId={causeId} 
                onComplete={handleSubmitComplete}
                isSubmitting={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <SponsorBenefits />
        </div>
      </div>
    </div>
  );
};

export default SponsorFormContainer;
