
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Camera, X } from 'lucide-react';
import { ToteClaim } from '@/types';

const QrScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claims, setClaims] = useState<ToteClaim[]>([]);
  const [scannedClaims, setScannedClaims] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualClaimId, setManualClaimId] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Mock claims data
  const mockClaims = [
    {
      _id: 'claim123',
      causeId: 'cause1',
      userId: 'user1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      organization: 'Community Outreach',
      shippingAddress: {
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
      },
      status: 'verified' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'claim456',
      causeId: 'cause2',
      userId: 'user2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-987-6543',
      organization: 'Education First',
      shippingAddress: {
        address: '456 Oak Ave',
        city: 'Somewhere',
        state: 'NY',
        zipCode: '67890',
      },
      status: 'verified' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  useEffect(() => {
    // In a real implementation, this would fetch claims from an API
    setClaims(mockClaims);
    
    // Clean up function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        
        // In a real implementation, you would add QR code scanning logic here
        // For mock purposes, we'll simulate scanning after a delay
        setTimeout(() => {
          handleSuccessfulScan('claim123');
        }, 3000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setScanning(false);
    }
  };

  const handleSuccessfulScan = (claimId: string) => {
    // Simulate QR code scanning success
    const claim = claims.find(c => c._id === claimId);
    
    if (claim) {
      if (scannedClaims.includes(claimId)) {
        toast({
          title: 'Already Scanned',
          description: `Claim for ${claim.fullName} was already marked as picked up.`,
        });
      } else {
        setScannedClaims(prev => [...prev, claimId]);
        toast({
          title: 'Success!',
          description: `Claim for ${claim.fullName} marked as picked up.`,
        });
      }
    } else {
      toast({
        title: 'Invalid QR Code',
        description: 'This QR code does not match any valid claims.',
        variant: 'destructive',
      });
    }
    
    stopScanner();
  };

  const handleManualEntry = () => {
    if (!manualClaimId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a claim ID',
        variant: 'destructive',
      });
      return;
    }
    
    handleSuccessfulScan(manualClaimId.trim());
    setManualClaimId('');
  };

  const handleBulkMarkPickedUp = () => {
    toast({
      title: 'Success!',
      description: `${scannedClaims.length} claims marked as picked up.`,
    });
    
    // In a real implementation, this would call an API to update claims
  };

  return (
    <AdminLayout title="QR Code Scanner" subtitle="Scan event QR codes to mark claims as picked up">
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            {scanning ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md aspect-square mb-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-green-500 opacity-50"></div>
                  </div>
                </div>
                <Button onClick={stopScanner} variant="outline" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel Scanning
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 space-y-6">
                <Button onClick={startScanner} className="flex items-center gap-2 h-14 px-8 text-lg">
                  <Camera className="h-6 w-6" />
                  Start QR Scanner
                </Button>
                
                <div className="text-center text-gray-500">- OR -</div>
                
                <div className="flex w-full max-w-sm gap-2">
                  <Input 
                    value={manualClaimId} 
                    onChange={(e) => setManualClaimId(e.target.value)}
                    placeholder="Enter claim ID manually" 
                  />
                  <Button onClick={handleManualEntry}>Submit</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Scanned Claims {scannedClaims.length > 0 && `(${scannedClaims.length})`}</h3>
        {scannedClaims.length > 0 && (
          <Button onClick={handleBulkMarkPickedUp} className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Save All as Picked Up
          </Button>
        )}
      </div>

      {scannedClaims.length > 0 ? (
        <div className="space-y-4">
          {scannedClaims.map(claimId => {
            const claim = claims.find(c => c._id === claimId);
            if (!claim) return null;
            
            return (
              <Card key={claimId}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{claim.fullName}</h4>
                    <p className="text-sm text-gray-500">{claim.organization}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No claims scanned yet. Start scanning or enter claim IDs manually.
        </div>
      )}
    </AdminLayout>
  );
};

export default QrScanner;
