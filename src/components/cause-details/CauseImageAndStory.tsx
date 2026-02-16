
import React from 'react';

interface CauseImageAndStoryProps {
  imageUrl: string;
  title: string;
  story: string;
}

const CauseImageAndStory = ({ imageUrl, title, story }: CauseImageAndStoryProps) => {
  return (
    <div className="md:col-span-1">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover rounded-md shadow-md"
      />
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-semibold">Story</h2>
        <p className="text-gray-700">{story}</p>
      </div>
    </div>
  );
};

export default CauseImageAndStory;
