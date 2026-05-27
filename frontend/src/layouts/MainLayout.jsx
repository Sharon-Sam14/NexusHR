import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-mesh flex text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="page-transition"
          >
            {children || <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
