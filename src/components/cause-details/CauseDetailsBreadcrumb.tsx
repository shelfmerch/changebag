
import React from 'react';
import { Link } from 'react-router-dom';

interface CauseDetailsBreadcrumbProps {
  causeTitle: string;
}

const CauseDetailsBreadcrumb = ({ causeTitle }: CauseDetailsBreadcrumbProps) => {
  return (
    <nav className="text-sm text-gray-600 mb-4">
      <Link to="/" className="hover:underline">Home</Link> &gt;
      <Link to="/causes" className="hover:underline"> Causes</Link> &gt;
      <span> {causeTitle}</span>
    </nav>
  );
};

export default CauseDetailsBreadcrumb;
