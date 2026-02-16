import axios from 'axios';
import config from '@/config';
import { Country, City, DistributionCategory, DistributionPoint, DistributionSettings } from '@/types/distribution';
import authAxios from '@/utils/authAxios';

// const BASE_URL = '/api/admin/distribution';
const BASE_URL = '/api/admin/distribution';

export const fetchDistributionSettings = async (): Promise<DistributionSettings> => {
  const { data } = await authAxios.get(`${BASE_URL}/settings`);
  return data;
};

export const fetchPointsByCityAndCategory = async (cityId: string, categoryId: string) => {
  const { data } = await authAxios.get(`${BASE_URL}/points/${cityId}/${categoryId}`);
  return data as DistributionPoint[];
};

export const createCountry = async (country: Partial<Country>): Promise<Country> => {
  const { data } = await authAxios.post(`${BASE_URL}/countries`, country);
  return data;
};

export const updateCountry = async (id: string, updates: Partial<Country>): Promise<Country> => {
  const { data } = await authAxios.put(`${BASE_URL}/countries/${id}`, updates);
  return data;
};

export const createCity = async (city: Partial<City>): Promise<City> => {
  const { data } = await authAxios.post(`${BASE_URL}/cities`, city);
  return data;
};

export const updateCity = async (id: string, updates: Partial<City>): Promise<City> => {
  const { data } = await authAxios.put(`${BASE_URL}/cities/${id}`, updates);
  return data;
};

export const createCategory = async (category: Partial<DistributionCategory>): Promise<DistributionCategory> => {
  const { data } = await authAxios.post(`${BASE_URL}/categories`, category);
  return data;
};

export const updateCategory = async (id: string, updates: Partial<DistributionCategory>): Promise<DistributionCategory> => {
  const { data } = await authAxios.put(`${BASE_URL}/categories/${id}`, updates);
  return data;
};

export const createDistributionPoint = async (point: Partial<DistributionPoint>): Promise<DistributionPoint> => {
  const { data } = await authAxios.post(`${BASE_URL}/points`, point);
  return data;
};

export const updateDistributionPoint = async (id: string, updates: Partial<DistributionPoint>): Promise<DistributionPoint> => {
  const { data } = await authAxios.put(`${BASE_URL}/points/${id}`, updates);
  return data;
};

export const deleteDistributionPoint = async (id: string): Promise<void> => {
  const { data } = await authAxios.delete(`${BASE_URL}/points/${id}`);
  return data;
};

export const updateCountryStatus = async (id: string, isActive: boolean) => {
  const response = await authAxios.patch(`${BASE_URL}/countries/${id}/status`, { isActive });
  return response.data;
};

export const updateCityStatus = async (id: string, isActive: boolean) => {
  const response = await authAxios.patch(`${BASE_URL}/cities/${id}/status`, { isActive });
  return response.data;
};

export const updateCategoryStatus = async (id: string, isActive: boolean) => {
  const response = await authAxios.patch(`${BASE_URL}/categories/${id}/status`, { isActive });
  return response.data;
};

export const updateDistributionPointStatus = async (id: string, isActive: boolean) => {
  const response = await authAxios.patch(`${BASE_URL}/points/${id}/status`, { isActive });
  return response.data;
};

export const deleteCountry = async (id: string) => {
  const response = await authAxios.delete(`${BASE_URL}/countries/${id}`);
  return response.data;
};

export const deleteCity = async (id: string) => {
  const response = await authAxios.delete(`${BASE_URL}/cities/${id}`);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await authAxios.delete(`${BASE_URL}/categories/${id}`);
  return response.data;
};
