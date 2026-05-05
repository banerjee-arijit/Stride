import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variant === "success" && "bg-primary/10 text-primary",
        variant === "muted" && "bg-muted text-muted-foreground",
        variant === "accent" && "bg-accent/20 text-foreground",
        className
      )}
      {...props}
    />
  );
}
