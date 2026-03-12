import { cn } from "../../utils/cn";

export function Card({ className, children }) {
  return <section className={cn("surface", className)}>{children}</section>;
}

export function CardHeader({ className, children }) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-app-border/70 px-6 py-5",
        className
      )}
    >
      {children}
    </header>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
