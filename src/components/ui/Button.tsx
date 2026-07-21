import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "solid", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-background";

    const variants = {
      solid:
        "bg-primary text-foreground hover:bg-black hover:text-foreground dark:hover:bg-white dark:hover:text-primary clip-angled",
      outline:
        "border border-primary text-primary hover:bg-primary hover:text-foreground clip-angled",
      glass:
        "glass-panel text-foreground hover:bg-primary hover:border-primary clip-angled shadow-lg hover:shadow-primary/30",
      ghost: "text-foreground/70 hover:text-secondary hover:translate-x-2 transform",
    };

    const sizes = {
      sm: "py-2 px-4 text-xs",
      md: "py-3 px-6 text-sm",
      lg: "py-4 px-8 text-base",
    };

    const variantStyles = variants[variant] || variants.solid;
    const sizeStyles = variant === "ghost" ? "" : sizes[size] || sizes.md;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        disabled={isLoading || disabled}
        aria-disabled={isLoading || disabled ? "true" : undefined}
        aria-busy={isLoading ? "true" : undefined}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">Yükleniyor...</span>
            <span aria-hidden="true">...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
