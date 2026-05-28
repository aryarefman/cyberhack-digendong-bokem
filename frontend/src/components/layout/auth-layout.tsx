import React from "react";

interface AuthLayoutProps {
  imagePosition: "left" | "right";
  imageUrl: string;
  imageAlt: string;
  quoteText: string;
  children: React.ReactNode;
}

export function AuthLayout({
  imagePosition,
  imageUrl,
  imageAlt,
  quoteText,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
      <div className="flex w-full max-w-7xl items-center gap-8 px-6">
        {/* Image Section - Left */}
        {imagePosition === "left" && (
          <div className="hidden lg:block flex-1">
            <div className="relative h-[600px] w-full overflow-hidden rounded-3xl shadow-xl">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {quoteText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="w-full flex-1 lg:max-w-md">{children}</div>

        {/* Image Section - Right */}
        {imagePosition === "right" && (
          <div className="hidden lg:block flex-1">
            <div className="relative h-[600px] w-full overflow-hidden rounded-3xl shadow-xl">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {quoteText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
