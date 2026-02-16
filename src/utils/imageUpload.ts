import axios from 'axios';
import config from '@/config';

export interface UploadOptions {
  endpoint: string;
  file: File | Blob;
  fileName?: string;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export async function uploadImage({
  endpoint,
  file,
  fileName = 'image',
  headers = {},
  onProgress
}: UploadOptions) {
  const formData = new FormData();
  formData.append('image', file, fileName);

  const response = await axios.post(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        ...headers
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
        onProgress?.(percentCompleted);
      },
      validateStatus: (status) => status >= 200 && status < 300
    }
  );

  return response.data;
}
