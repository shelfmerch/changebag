
export interface Country {
  _id?: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface City {
  _id?: string;
  countryId: string;
  name: string;
  state?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributionCategory {
  _id?: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  defaultToteCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributionPoint {
  _id?: string;
  cityId: string;
  categoryId: string;
  name: string;
  address?: string;
  defaultToteCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributionSettings {
  countries: Country[];
  cities: City[];
  categories: DistributionCategory[];
  points: DistributionPoint[];
}
