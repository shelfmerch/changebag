# Dynamic Content Management System

This document outlines the implementation of a comprehensive dynamic content management system that allows admins to upload and manage all content, including images, icons, FAQs, and other dynamic elements for each cause.

## Overview

The system has been enhanced to support fully dynamic content management where admins can:
- Upload and manage custom images for each section
- Configure dynamic icons and content
- Manage FAQs with categories
- Customize all text content
- Set custom theming and colors
- Configure SEO metadata
- Add testimonials, gallery, and partner information

## Database Schema Changes

### Extended Cause Model (`server/src/models/Cause.ts`)

The Cause model has been extended with the following new fields:

#### Hero Section
- `heroTitle`: Custom hero title (falls back to cause title)
- `heroSubtitle`: Custom hero subtitle (falls back to cause description)
- `heroImageUrl`: Custom hero image URL
- `heroBackgroundColor`: Custom background color

#### Impact Section
- `impactTitle`: Custom impact section title
- `impactSubtitle`: Custom impact section subtitle
- `impactStats`: Array of impact statistics with icons, values, labels, and descriptions

#### Progress Section
- `progressTitle`: Custom progress section title
- `progressSubtitle`: Custom progress section subtitle
- `progressBackgroundImageUrl`: Custom background image for progress section
- `progressCards`: Array of progress cards with titles, values, descriptions, and icons

#### FAQs
- `faqs`: Array of FAQ items with questions, answers, and optional categories

#### Call to Action
- `ctaTitle`: Custom CTA title
- `ctaSubtitle`: Custom CTA subtitle
- `ctaPrimaryButtonText`: Custom primary button text
- `ctaSecondaryButtonText`: Custom secondary button text

#### Theming
- `primaryColor`: Custom primary color
- `secondaryColor`: Custom secondary color
- `accentColor`: Custom accent color
- `customCSS`: Custom CSS styles

#### SEO
- `metaTitle`: SEO meta title
- `metaDescription`: SEO meta description
- `metaKeywords`: Array of SEO keywords
- `ogImageUrl`: Open Graph image URL

#### Additional Content
- `testimonials`: Array of testimonials with names, roles, content, and avatars
- `gallery`: Array of gallery images with captions and alt text
- `partners`: Array of partner information with logos and websites

## Frontend Changes

### Updated Types (`src/types/index.ts`)

The Cause interface has been extended to include all the new dynamic content fields.

### Dynamic Cause Page (`src/pages/DynamicCausePage.tsx`)

The dynamic cause page now:
- Uses dynamic content from the database with fallbacks to generated content
- Supports custom hero titles, subtitles, and images
- Renders dynamic impact stats with icon mapping
- Displays custom progress cards with dynamic icons
- Shows custom FAQs from the database
- Uses custom CTA text and button labels
- Applies custom theming and colors

### Icon Mapping System

A comprehensive icon mapping system has been implemented to support dynamic icons:
- Maps icon names to actual icon components
- Supports common icons: Users, ShoppingBag, Heart, TrendingDown, TreePine, Globe, Leaf, Gift, Megaphone
- Falls back to Heart icon if icon name is not found

## Admin Interface

### Content Editor (`src/pages/admin/CauseContentEditor.tsx`)

A comprehensive admin interface for managing all dynamic content:

#### Features
- **Tabbed Interface**: Organized into Hero, Impact, Progress, FAQs, CTA, and Advanced sections
- **Real-time Preview**: Preview changes before saving
- **Image Upload Support**: Upload and manage images for each section
- **Dynamic Arrays**: Add/remove impact stats, progress cards, FAQs, testimonials, gallery items, and partners
- **Icon Selection**: Choose from predefined icon options
- **Color Picker**: Set custom colors for theming
- **SEO Configuration**: Set meta titles, descriptions, and keywords
- **Custom CSS**: Add custom CSS styles

#### Sections

1. **Hero Section**
   - Hero title and subtitle
   - Hero image URL
   - Background color

2. **Impact Section**
   - Impact title and subtitle
   - Dynamic impact stats with icons, values, labels, and descriptions

3. **Progress Section**
   - Progress title and subtitle
   - Background image URL
   - Dynamic progress cards with icons and additional info

4. **FAQs**
   - Add/remove FAQ items
   - Question, answer, and optional category

5. **Call to Action**
   - CTA title and subtitle
   - Primary and secondary button text

6. **Advanced Settings**
   - Custom colors (primary, secondary, accent)
   - Custom CSS
   - SEO metadata
   - Open Graph image

### Admin Routes

New route added for content editing:
- `/admin/causes/:id/content` - Content editor for specific cause

### Updated Admin Causes Management

The causes management page now includes a "Content" button for each cause that navigates to the content editor.

## Backend API

### New Endpoint (`server/src/routes/causes.ts`)

**PUT `/causes/:id/content`**
- Updates cause content with all dynamic fields
- Requires admin authentication
- Validates input data
- Returns updated cause object

#### Request Body
```json
{
  "heroTitle": "Custom Hero Title",
  "heroSubtitle": "Custom hero subtitle",
  "heroImageUrl": "https://example.com/hero-image.jpg",
  "impactStats": [
    {
      "icon": "Users",
      "value": "1,234",
      "label": "People Helped",
      "description": "Additional description"
    }
  ],
  "progressCards": [
    {
      "title": "Amount Raised",
      "value": "₹50,000",
      "description": "Out of ₹100,000 target",
      "icon": "TrendingDown",
      "additionalInfo": "50% of goal reached"
    }
  ],
  "faqs": [
    {
      "question": "How can I get involved?",
      "answer": "You can sponsor this cause or claim a tote bag.",
      "category": "General"
    }
  ],
  "ctaTitle": "Join the Movement",
  "ctaSubtitle": "Be part of the solution",
  "ctaPrimaryButtonText": "🎁 Claim Your Free Bag",
  "ctaSecondaryButtonText": "📢 Sponsor This Cause",
  "primaryColor": "#3b82f6",
  "secondaryColor": "#1e40af",
  "accentColor": "#f59e0b",
  "customCSS": "/* Custom styles */",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "metaKeywords": ["keyword1", "keyword2"],
  "ogImageUrl": "https://example.com/og-image.jpg",
  "testimonials": [
    {
      "name": "John Doe",
      "role": "Supporter",
      "content": "Great initiative!",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  ],
  "gallery": [
    {
      "imageUrl": "https://example.com/gallery1.jpg",
      "caption": "Gallery caption",
      "alt": "Gallery alt text"
    }
  ],
  "partners": [
    {
      "name": "Partner Name",
      "logoUrl": "https://example.com/logo.jpg",
      "website": "https://partner.com"
    }
  ]
}
```

## Usage

### For Admins

1. **Access Content Editor**:
   - Go to Admin Dashboard → Causes Management
   - Click "Content" button for any cause
   - Navigate to `/admin/causes/:id/content`

2. **Edit Content**:
   - Use the tabbed interface to navigate between sections
   - Fill in the desired content for each section
   - Upload images or provide image URLs
   - Choose icons from the predefined list
   - Set custom colors and CSS
   - Configure SEO metadata

3. **Save Changes**:
   - Click "Save Changes" to persist all modifications
   - Changes are immediately reflected on the cause page

### For Developers

1. **Adding New Icon Types**:
   - Add new icon names to the `getIconComponent` function in `DynamicCausePage.tsx`
   - Import the icon component from lucide-react
   - Add to the icon mapping object

2. **Extending Content Types**:
   - Add new fields to the Cause model in `server/src/models/Cause.ts`
   - Update the frontend types in `src/types/index.ts`
   - Add corresponding form fields in the content editor
   - Update the API endpoint to handle new fields

3. **Custom Styling**:
   - Use the `customCSS` field for cause-specific styles
   - Apply custom colors through the theming fields
   - Override default styles using the dynamic color system

## Benefits

1. **Full Content Control**: Admins can customize every aspect of cause pages
2. **Dynamic Icons**: Support for various icon types with easy mapping
3. **Flexible Layout**: Each section can be customized independently
4. **SEO Optimization**: Full control over meta tags and social sharing
5. **Rich Media**: Support for images, testimonials, gallery, and partner logos
6. **User-Friendly Interface**: Intuitive tabbed interface for content management
7. **Fallback System**: Graceful degradation when custom content is not provided

## Future Enhancements

1. **Rich Text Editor**: Add WYSIWYG editor for text content
2. **Image Upload**: Direct image upload functionality
3. **Template System**: Pre-built templates for common cause types
4. **Version Control**: Track content changes and rollback functionality
5. **Bulk Operations**: Edit multiple causes at once
6. **Content Scheduling**: Schedule content changes for specific dates
7. **Analytics**: Track content performance and engagement

## Technical Notes

- All dynamic content is stored in the MongoDB database
- The system uses a fallback mechanism to ensure pages always render
- Icon mapping is handled client-side for performance
- Content updates are immediately reflected without page refresh
- The system maintains backward compatibility with existing causes 