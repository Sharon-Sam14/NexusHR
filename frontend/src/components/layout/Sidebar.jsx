
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Employees", "/employees"],
    ["Attendance", "/attendance"],
    ["Payroll", "/payroll"],
    ["Leave", "/leave"],
    ["Profile", "/profile"],
  ];

  return (
    <aside className="w-72 fixed h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 p-6">
      <h1 className="text-4xl font-bold text-cyan-400 mb-10">NexusHR</h1>

      <div className="space-y-2">
        {links.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className="block p-4 rounded-2xl hover:bg-cyan-500/10 transition"
          >
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
