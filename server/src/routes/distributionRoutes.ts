import express from 'express';
import { createRouter } from '../utils/routerHelper';
import {
  getSettings,
  createCountry,
  updateCountry,
  deleteCountry,
  createCity,
  updateCity,
  deleteCity,
  createCategory,
  updateCategory,
  deleteCategory,
  createPoint,
  updatePoint,
  deletePoint,
  getPointsByCityAndCategory,
  updateCountryStatus,
  updateCityStatus,
  updateCategoryStatus,
  updatePointStatus
} from '../controllers/distributionController';

const router = createRouter();

// Settings
router.get('/settings', getSettings);

// Points by city and category
router.get('/points/:cityId/:categoryId', getPointsByCityAndCategory);

// Countries
router.post('/countries', createCountry);
router.put('/countries/:id', updateCountry);
router.delete('/countries/:id', deleteCountry);
router.patch('/countries/:id/status', updateCountryStatus);

// Cities
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);
router.delete('/cities/:id', deleteCity);
router.patch('/cities/:id/status', updateCityStatus);

// Categories
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/status', updateCategoryStatus);

// Points
router.post('/points', createPoint);
router.put('/points/:id', updatePoint);
router.delete('/points/:id', deletePoint);
router.patch('/points/:id/status', updatePointStatus);

export default router; 