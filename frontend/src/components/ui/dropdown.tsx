import * as React from "react";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className, label, options, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-3.5 py-2.5 text-sm rounded-lg glass-input text-white appearance-none cursor-pointer pr-10 disabled:opacity-50",
              error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "",
              className
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1.25rem",
              backgroundRepeat: "no-repeat"
            }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-950 text-white py-2">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;
