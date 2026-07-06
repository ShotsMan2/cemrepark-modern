export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 animate-shimmer ${className}`}
      {...props}
    />
  );
}
