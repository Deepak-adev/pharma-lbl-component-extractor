import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'normal' | 'large';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'normal', className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-brand-blue text-white hover:bg-opacity-90 shadow-md focus:ring-brand-blue',
    secondary: 'bg-base-300 text-text-primary hover:bg-opacity-80 focus:ring-base-300',
    ghost: 'bg-base-100/80 text-text-secondary hover:bg-base-300 hover:text-text-primary focus:ring-brand-secondary shadow-sm border border-base-300'
  };

  const sizeClasses = {
    small: 'py-1 px-2 text-xs',
    normal: 'py-2 px-4 text-sm',
    large: 'py-3 px-6 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;