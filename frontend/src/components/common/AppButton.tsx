import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  ghost: "text-slate-600 hover:bg-slate-100",
};

export function AppButton({
  children,
  className,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
