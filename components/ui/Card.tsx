import React from 'react';

// Fix: Extend CardProps with React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-base-100 border border-base-300 rounded-lg shadow-subtle ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;