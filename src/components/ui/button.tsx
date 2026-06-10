import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded border font-medium transition-colors disabled:opacity-50",
          variant === "default" &&
            "border-stone-800 bg-stone-800 text-stone-50 hover:bg-stone-700",
          variant === "outline" &&
            "border-stone-300 bg-transparent text-stone-800 hover:bg-stone-100",
          variant === "ghost" &&
            "border-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
