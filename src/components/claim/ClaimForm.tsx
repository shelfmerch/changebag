import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ClaimForm = () => {
  const { toast } = useToast();
  const [causeId, setCauseId] = useState('');
  const [sponsorshipId, setSponsorshipId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/claims', {
        causeId,
        sponsorshipId,
        name,
        email,
        phone,      // Make sure these fields
        address,    // are included in the
        city,       // form submission
        state,
        zipCode
      });
      
      toast({
        title: 'Claim submitted',
        description: 'Your claim has been submitted successfully.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error submitting claim',
        description: 'Please check your details and try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          required
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city"
          required
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Enter your state"
          required
        />
      </div>
      <div>
        <Label htmlFor="zipCode">Zip Code</Label>
        <Input
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter your zip code"
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="w-full">
          Submit Claim
        </Button>
      </div>
    </form>
  );
};

export default ClaimForm;