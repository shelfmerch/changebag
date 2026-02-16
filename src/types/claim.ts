export interface Claim {
  _id: string;
  causeId: string;
  sponsorshipId: string;
  name: string;
  email: string;
  phone: string;  // Add phone field
  address: string;  // Add address field
  city: string;    // Add city field
  state: string;   // Add state field
  zipCode: string; // Add zipCode field
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
