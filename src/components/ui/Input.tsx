import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  className = "", 
  label, 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-foreground/70 text-xs font-bold mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-black/5 dark:bg-black/50 border ${error ? 'border-red-500' : 'border-black/10 dark:border-white/10'} text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ 
  className = "", 
  label, 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-foreground/70 text-xs font-bold mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full bg-black/5 dark:bg-black/50 border ${error ? 'border-red-500' : 'border-black/10 dark:border-white/10'} text-foreground px-4 py-3 text-sm focus:border-neon-pink outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";
