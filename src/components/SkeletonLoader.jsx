export function SkeletonLoader({ rows = 3 }) {
  return (
    <div className="space-y-2" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded-md bg-app-border/70"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
