
import React from 'react';

interface CauseDetailsHeaderProps {
  title: string;
  description: string;
}

const CauseDetailsHeader = ({ title, description }: CauseDetailsHeaderProps) => {
  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </section>
  );
};

export default CauseDetailsHeader;
