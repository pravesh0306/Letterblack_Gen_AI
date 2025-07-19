import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#4a9eff] disabled:opacity-50 disabled:pointer-events-none relative';
  
  const variants = {
    primary: 'btn-gradient-primary text-white',
    secondary: 'gradient-secondary hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] text-[#a0a0a0] hover:text-white border border-[#333333]',
    ghost: 'hover:bg-gradient-to-br hover:from-[#262626] hover:to-[#1a1a1a] text-[#a0a0a0] hover:text-white'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} scalable-text ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}