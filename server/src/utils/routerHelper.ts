import express from 'express';

// This helper function creates a router instance with proper TypeScript typing
export const createRouter = () => {
  // Use type assertion to work around TypeScript errors
  return (express as any).Router();
};
