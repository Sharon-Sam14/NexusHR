
export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-5xl font-bold mt-4">{value}</h2>
    </div>
  );
}
