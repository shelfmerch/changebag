export interface Sponsorship {
  _id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  causeId: string;
  logoUrl: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // removed: distributionPoints, physicalDistributionDetails, distributionLocations
}
