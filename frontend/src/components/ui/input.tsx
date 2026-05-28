import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, icon, trailingIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-zinc-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full px-3.5 py-2.5 text-sm rounded-lg glass-input text-white placeholder:text-zinc-500 disabled:opacity-50",
              icon ? "pl-10" : "pl-3.5",
              trailingIcon ? "pr-10" : "pr-3.5",
              error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "",
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 text-zinc-500 flex items-center justify-center cursor-pointer">
              {trailingIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
