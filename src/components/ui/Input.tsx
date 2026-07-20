import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  className = "", 
  label, 
  error, 
  id: customId,
  ...props 
}, ref) => {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-foreground/70 text-xs font-bold mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-black/5 dark:bg-black/50 border ${error ? 'border-red-500' : 'border-black/10 dark:border-white/10'} text-foreground px-4 py-3 text-sm focus:border-neon-pink focus-visible:ring-2 focus-visible:ring-neon-pink focus-visible:outline-none focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-colors ${className}`}
        {...props}
      />
      {error && <p id={errorId} className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
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
  id: customId,
  ...props 
}, ref) => {
  const generatedId = useId();
  const id = customId || generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-foreground/70 text-xs font-bold mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-black/5 dark:bg-black/50 border ${error ? 'border-red-500' : 'border-black/10 dark:border-white/10'} text-foreground px-4 py-3 text-sm focus:border-neon-pink focus-visible:ring-2 focus-visible:ring-neon-pink focus-visible:outline-none focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-colors ${className}`}
        {...props}
      />
      {error && <p id={errorId} className="mt-1 text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";
