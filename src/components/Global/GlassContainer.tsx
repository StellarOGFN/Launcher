import React from "react";

interface GlassProps {
  children: React.ReactNode;
  className?: string;
}

const GlassContainer: React.FC<GlassProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-25 backdrop-saturate-150 backdrop-contrast-110 border border-white/20 p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassContainer;
