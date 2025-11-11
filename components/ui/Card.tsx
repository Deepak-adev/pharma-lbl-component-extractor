import React from 'react';

// Fix: Extend CardProps with React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;