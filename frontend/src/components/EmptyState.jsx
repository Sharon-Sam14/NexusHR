import { Inbox } from "lucide-react";

export default function EmptyState({ message = "No data found", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Inbox size={24} className="text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-slate-300">{message}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
