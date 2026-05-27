export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full border-slate-700 border-t-cyan-400 animate-spin`}
      />
    </div>
  );
}
