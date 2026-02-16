import axios from 'axios';
import config from '@/config';

export interface TotePreviewImage {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

const API_BASE = `${config.apiUrl}/admin/tote-preview-images`;

export const getTotePreviewImages = async (): Promise<TotePreviewImage[]> => {
  const { data } = await axios.get(API_BASE);
  return data;
};

export const uploadTotePreviewImage = async (formData: FormData): Promise<TotePreviewImage> => {
  const { data } = await axios.post(API_BASE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const deleteTotePreviewImage = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};

// Function to upload a tote preview image for a specific cause
export const uploadCauseTotePreviewImage = async (causeId: string, formData: FormData): Promise<any> => {
  const token = localStorage.getItem('token');
  const { data } = await axios.post(`${config.apiUrl}/causes/${causeId}/tote-preview`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
  });
  return data;
};
