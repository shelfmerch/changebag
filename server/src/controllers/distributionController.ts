import { Request, Response } from 'express';
import Country from '../models/Country';
import City from '../models/City';
import DistributionCategory from '../models/DistributionCategory';
import DistributionPoint from '../models/DistributionPoint';

export const getSettings = async (req: Request, res: Response) => {
  const [countries, cities, categories, points] = await Promise.all([
    Country.find(),
    City.find(),
    DistributionCategory.find(),
    DistributionPoint.find()
  ]);
  res.json({ countries, cities, categories, points });
};

// Get points by city and category
export const getPointsByCityAndCategory = async (req: Request, res: Response) => {
  const { cityId, categoryId } = req.params;
  const points = await DistributionPoint.find({
    cityId,
    categoryId,
    isActive: true
  });
  res.json(points);
};

// Country
export const createCountry = async (req: Request, res: Response) => {
  const country = await Country.create(req.body);
  res.json(country);
};
export const updateCountry = async (req: Request, res: Response) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(country);
};

// City
export const createCity = async (req: Request, res: Response) => {
  const city = await City.create(req.body);
  res.json(city);
};
export const updateCity = async (req: Request, res: Response) => {
  const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(city);
};

// Category
export const createCategory = async (req: Request, res: Response) => {
  const category = await DistributionCategory.create(req.body);
  res.json(category);
};
export const updateCategory = async (req: Request, res: Response) => {
  const category = await DistributionCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(category);
};

// Point
export const createPoint = async (req: Request, res: Response) => {
  try {
    const { name, cityId, categoryId, isActive } = req.body;
    
    // If defaultToteCount is not provided, get it from the category
    let defaultToteCount = req.body.defaultToteCount;
    if (!defaultToteCount && categoryId) {
      const category = await DistributionCategory.findById(categoryId);
      if (category) {
        defaultToteCount = category.defaultToteCount;
      }
    }
    
    const point = await DistributionPoint.create({
      name,
      cityId,
      categoryId,
      defaultToteCount: defaultToteCount || 400, // fallback to 400 if no category found
      isActive: isActive ?? true
    });
    res.json(point);
  } catch (error) {
    console.error('Error creating distribution point:', error);
    res.status(500).json({ message: 'Error creating distribution point' });
  }
};
export const updatePoint = async (req: Request, res: Response) => {
  const point = await DistributionPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(point);
};
export const deletePoint = async (req: Request, res: Response) => {
  await DistributionPoint.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// Delete methods
export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const country = await Country.findByIdAndDelete(id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ message: 'Error deleting country' });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ message: 'Error deleting city' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await DistributionCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Status update methods
export const updateCountryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const country = await Country.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    res.json(country);
  } catch (error) {
    console.error('Error updating country status:', error);
    res.status(500).json({ message: 'Error updating country status' });
  }
};

export const updateCityStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const city = await City.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json(city);
  } catch (error) {
    console.error('Error updating city status:', error);
    res.status(500).json({ message: 'Error updating city status' });
  }
};

export const updateCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const category = await DistributionCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ message: 'Error updating category status' });
  }
};

export const updatePointStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const point = await DistributionPoint.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!point) {
      return res.status(404).json({ message: 'Distribution point not found' });
    }
    res.json(point);
  } catch (error) {
    console.error('Error updating distribution point status:', error);
    res.status(500).json({ message: 'Error updating distribution point status' });
  }
}; 