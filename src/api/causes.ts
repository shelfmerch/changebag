import axios from 'axios';
import config from '@/config';

export interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  totePreviewImageUrl?: string;
  adminImageUrl?: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
}

// Get all causes with optional filters
export const getCauses = async (filters?: { status?: string; category?: string }): Promise<Cause[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) {
    queryParams.append('status', filters.status);
  }
  
  if (filters?.category) {
    queryParams.append('category', filters.category);
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const { data } = await axios.get(`${config.apiUrl}/causes${queryString}`);
  return data;
};

// Get a single cause by ID
export const getCauseById = async (id: string): Promise<Cause> => {
  const { data } = await axios.get(`${config.apiUrl}/causes/${id}`);
  return data;
};

// Get all approved causes
export const getApprovedCauses = async (): Promise<Cause[]> => {
  return getCauses({ status: 'approved' });
};
