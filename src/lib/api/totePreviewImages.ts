import axios from 'axios';

export interface TotePreviewImage {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

const API_BASE = '/api/admin/tote-preview-images';

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
