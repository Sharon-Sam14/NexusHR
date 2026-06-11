
import Sidebar from "../components/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-slate-950 min-h-screen text-white">
      <Sidebar />

      <div className="ml-72 w-full p-8">
        {children}
      </div>
    </div>
  );
}
