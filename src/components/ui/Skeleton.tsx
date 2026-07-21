import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "table" | "chart" | "circle";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = "", variant = "text", width, height, style, ...props }: SkeletonProps) {
  const baseClass = "skeleton rounded-xl";

  const variantClasses: Record<string, string> = {
    text: "h-4 w-full",
    card: "h-48 w-full rounded-2xl",
    table: "h-10 w-full",
    chart: "h-32 w-full rounded-2xl",
    circle: "h-10 w-10 rounded-full",
  };

  const variantClass = variantClasses[variant] || variantClasses.text;

  const combinedStyle: React.CSSProperties = {
    ...(width ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    ...style,
  };

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={combinedStyle}
      {...props}
    />
  );
}
