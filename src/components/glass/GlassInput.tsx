import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn("glass-input", className)}
        {...props}
      />
    );
  }
);

GlassInput.displayName = "GlassInput";
