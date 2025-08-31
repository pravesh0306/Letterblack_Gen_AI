import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  const classes = `w-full px-2 py-1 border border-[#333333] rounded gradient-secondary text-white text-xs placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#4a9eff] focus:border-transparent transition-all duration-200 ${className}`;

  return <input className={classes} {...props} />;
}