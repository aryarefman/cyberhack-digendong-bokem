import Link from "next/link";
import React from "react";

interface AuthFormWrapperProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export function AuthFormWrapper({
  title,
  subtitle,
  onBack,
  children,
}: AuthFormWrapperProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back
          </button>
        )}
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-lg text-gray-600">{subtitle}</p>
      </div>

      {/* Form Content */}
      {children}
    </div>
  );
}
