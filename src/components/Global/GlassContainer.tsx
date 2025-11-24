import React from "react";

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassContainer: React.FC<GlassProps> = ({
  children,
  className = "",
  onClick,
  style,
}) => {
  return (
    <div
      className={`bg-gray-500/5 bg-clip-padding backdrop-filter backdrop-blur-lg
         backdrop-saturate-100 backdrop-contrast-100
        shadow-xl border border-white/20 ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassContainer;
