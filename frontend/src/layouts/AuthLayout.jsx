export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/8 blur-3xl rounded-full -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/8 blur-3xl rounded-full -bottom-20 -right-20 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-cyan-400/5 blur-3xl rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
