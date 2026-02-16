
// This is a simplified model representation since we're not using Mongoose in this project
export interface Story {
  id: string;
  title: string;
  authorName: string;
  imageUrl?: string;
  content: string;
  excerpt: string;
  createdAt: Date;
}
