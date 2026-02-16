# Dynamic Cause Pages Implementation

## Overview

This implementation replaces the static mock pages with dynamic cause pages that fetch data from the database and render content based on the actual cause data.

## Changes Made

### 1. New Dynamic Cause Page Component
- **File**: `src/pages/DynamicCausePage.tsx`
- **Features**:
  - Fetches cause data from the API using React Query
  - Renders dynamic content based on cause properties
  - Maintains the same design and layout as the original mock pages
  - Supports category-specific theming (colors, icons)
  - Includes loading and error states
  - Provides claim and sponsor functionality

### 2. Updated Routing
- **File**: `src/App.tsx`
- **Changes**:
  - Replaced mock page routes with dynamic cause routes
  - Updated `/cause/:id` route to use `DynamicCausePage`
  - Added `/causes/:id` route for consistency
  - Removed all mock page imports and routes

### 3. Updated Navigation
- **Files**: `src/pages/Index.tsx`, `src/pages/Causes.tsx`
- **Changes**:
  - Removed mock page route mapping logic
  - Updated all cause links to use dynamic routes (`/cause/:id`)
  - Simplified navigation logic

### 4. Removed Mock Pages
- **Deleted Files**:
  - `src/pages/mock/LookUpNotDown.tsx`
  - `src/pages/mock/RespectAtWork.tsx`
  - `src/pages/mock/PlantMoreTrees.tsx`
  - `src/pages/mock/SayNoToPlastic.tsx`
  - `src/pages/mock/SaveWaterSaveLife.tsx`
  - `src/pages/mock/MentalHealthMatters.tsx`
- **Removed Directory**: `src/pages/mock/`

## Features

### Dynamic Content
- **Title**: Uses `cause.title` from database
- **Description**: Uses `cause.description` from database
- **Image**: Uses `cause.imageUrl` from database
- **Category**: Uses `cause.category` for theming
- **Progress**: Shows `cause.currentAmount` vs `cause.targetAmount`
- **Stats**: Displays bags available, total sponsored, active sponsors

### Category-Specific Theming
- **Environment/Reforestation**: Green theme with TreePine icon
- **Health/Mental Health**: Red theme with Heart icon
- **Water/Conservation**: Blue theme with Globe icon
- **Workplace/Respect**: Purple theme with Users icon
- **Plastic/Waste**: Green theme with Leaf icon
- **Default**: Primary theme with Heart icon

### Interactive Features
- **Claim Button**: Navigates to `/claim/:id`
- **Sponsor Button**: Navigates to `/sponsor/new?causeId=:id`
- **Share Functionality**: Uses Web Share API or clipboard fallback
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Displays error messages and retry options

## API Integration

### Data Fetching
- Uses React Query for efficient data fetching
- Fetches from `/api/causes/:id` endpoint
- Includes sponsorships and claim statistics
- Handles loading and error states gracefully

### Data Structure
The component expects cause data with the following structure:
```typescript
interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  totalTotes?: number;
  availableTotes?: number;
  sponsorships?: Array<{ status: string }>;
  createdAt: string;
}
```

## Benefits

1. **Scalability**: Any new cause added to the database automatically gets its own page
2. **Consistency**: All cause pages follow the same design and functionality
3. **Maintainability**: Single component handles all cause pages
4. **Performance**: Uses React Query for efficient caching and updates
5. **User Experience**: Maintains the same beautiful design as mock pages
6. **SEO Friendly**: Each cause has its own unique URL

## Usage

### For Users
- Navigate to `/causes` to browse all causes
- Click on any cause to view its dynamic page
- Use claim or sponsor buttons to get involved

### For Developers
- Add new causes through the admin interface
- Each cause automatically gets a page at `/cause/:id`
- No need to create individual page components
- All styling and functionality is handled automatically

## Future Enhancements

1. **SEO Optimization**: Add meta tags and structured data
2. **Social Sharing**: Enhanced sharing with custom images
3. **Analytics**: Track page views and interactions
4. **Caching**: Implement more aggressive caching strategies
5. **Progressive Enhancement**: Add offline support
6. **A/B Testing**: Test different layouts and content 