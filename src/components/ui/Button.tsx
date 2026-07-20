import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className = "", 
  variant = "solid", 
  size = "md", 
  isLoading, 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-neon-pink text-foreground hover:bg-black hover:text-foreground dark:hover:bg-white dark:hover:text-neon-pink clip-angled",
    outline: "border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-foreground clip-angled",
    glass: "glass-panel text-foreground hover:bg-neon-pink hover:border-neon-pink clip-angled shadow-lg hover:shadow-neon-pink/30",
    ghost: "text-foreground/70 hover:text-holo-gold hover:translate-x-2 transform",
  };

  const sizes = {
    sm: "py-2 px-4 text-xs",
    md: "py-3 px-6 text-sm",
    lg: "py-4 px-8 text-base",
  };

  const variantStyles = variants[variant] || variants.solid;
  const sizeStyles = variant === 'ghost' ? "" : (sizes[size] || sizes.md);

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
});

Button.displayName = "Button";
