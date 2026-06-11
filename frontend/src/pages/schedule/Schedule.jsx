import { useState } from "react";
import {
  CalendarDots, Plus, X, Trash, CaretLeft, CaretRight,
  MapPin, Clock, Users, Briefcase, Coffee, Star
} from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import PageTransition from "../../layouts/PageTransition";

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const COLOR_OPTIONS = [
  { value: "blue",    label: "🔵 Blue",   dot: "bg-blue-500",    bar: "border-blue-500 bg-blue-500/8"   },
  { value: "emerald", label: "🟢 Green",  dot: "bg-emerald-500", bar: "border-emerald-500 bg-emerald-500/8" },
  { value: "amber",   label: "🟡 Amber",  dot: "bg-amber-500",   bar: "border-amber-500 bg-amber-500/8" },
  { value: "rose",    label: "🔴 Red",    dot: "bg-rose-500",    bar: "border-rose-500 bg-rose-500/8"   },
  { value: "violet",  label: "🟣 Purple", dot: "bg-violet-500",  bar: "border-violet-500 bg-violet-500/8"},
  { value: "slate",   label: "⚪ Slate",  dot: "bg-slate-400",   bar: "border-slate-300 bg-slate-200/20 border-dashed" },
];

const TYPE_ICONS = {
  meeting:   <Users size={12} />,
  interview: <Briefcase size={12} />,
  break:     <Coffee size={12} />,
  review:    <Star size={12} />,
  other:     <CalendarDots size={12} />,
};

const colorBar  = (c) => COLOR_OPTIONS.find(o => o.value === c)?.bar  || COLOR_OPTIONS[0].bar;
const colorDot  = (c) => COLOR_OPTIONS.find(o => o.value === c)?.dot  || COLOR_OPTIONS[0].dot;

// Key: "YYYY-MM-DD"
const dateKey = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const todayKey = () => {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const seedDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
};

const SEED_EVENTS = [
  { id: 1, date: seedDate(0), title: "Team Sync-Up (Marketing)", time: "09:00 - 11:00 AM", location: "Room B",  color: "blue",   type: "meeting"   },
  { id: 2, date: seedDate(0), title: "Lunch Break",               time: "12:00 - 01:00 PM", location: "",        color: "slate",  type: "break"     },
  { id: 3, date: seedDate(0), title: "Interview: Sarah Lee (Dev)",time: "14:00 - 15:00 PM", location: "Room D",  color: "emerald",type: "interview" },
  { id: 4, date: seedDate(1), title: "Performance Review — Q2",   time: "10:00 - 11:30 AM", location: "Room A",  color: "violet", type: "review"    },
  { id: 5, date: seedDate(2), title: "All-Hands Quarterly Update", time: "09:00 - 10:00 AM", location: "Auditorium", color: "amber", type: "meeting" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Schedule() {
  const { isHR } = useAuth();
  const now   = new Date();

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [events,    setEvents]    = useState(SEED_EVENTS);
  const [selected,  setSelected]  = useState(todayKey());

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", time: "", location: "", color: "blue", type: "meeting" });
  const [formErr, setFormErr] = useState("");

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Events on a given grid date
  const eventsOn = (dk) => events.filter(e => e.date === dk);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!form.title.trim()) { setFormErr("Title is required."); return; }
    if (!form.time.trim())  { setFormErr("Time is required.");  return; }
    setEvents(prev => [...prev, { ...form, id: Date.now(), date: selected }]);
    setForm({ title: "", time: "", location: "", color: "blue", type: "meeting" });
    setFormErr("");
    setShowForm(false);
  };

  const handleDelete = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  // ── Selected day's events ─────────────────────────────────────────────────
  const dayEvents = eventsOn(selected);

  // ── Formatted selected date label ─────────────────────────────────────────
  const selDate   = selected ? new Date(selected + "T00:00:00") : null;
  const selLabel  = selDate
    ? selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-[var(--brand-primary)]" />
              <h1 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}>
                Schedule
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-body pl-3">
              Manage meetings, interviews, and daily work events across your team.
            </p>
          </div>

          {/* Add Event Button — HR/Admin only */}
          {isHR() && (
            <button
              onClick={() => { setShowForm(v => !v); setFormErr(""); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-body text-white bg-[var(--brand-primary)] hover:opacity-90 transition-opacity shadow-sm"
            >
              {showForm ? <X size={14} /> : <Plus size={14} />}
              {showForm ? "Cancel" : "Add Event"}
            </button>
          )}
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Calendar ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Calendar Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm">

              {/* Month Nav */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors">
                  <CaretLeft size={14} weight="bold" />
                </button>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-body tracking-wide">
                  {MONTHS[viewMonth]} {viewYear}
                </h2>
                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors">
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 font-body py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dk  = dateKey(viewYear, viewMonth, day);
                  const isToday    = dk === todayKey();
                  const isSelected = dk === selected;
                  const dayEvts   = eventsOn(dk);

                  return (
                    <button
                      key={dk}
                      onClick={() => setSelected(dk)}
                      className={`
                        relative flex flex-col items-center rounded-xl py-1.5 px-0.5 transition-all group
                        ${isSelected
                          ? "bg-[var(--brand-primary)] text-white shadow-md"
                          : isToday
                            ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"}
                      `}
                    >
                      <span className={`text-[12px] font-semibold font-body ${isSelected ? "text-white" : ""}`}>
                        {day}
                      </span>
                      {/* Event dots */}
                      {dayEvts.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                          {dayEvts.slice(0, 3).map((e, idx) => (
                            <span
                              key={idx}
                              className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : colorDot(e.color)}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/40 flex items-center flex-wrap gap-4 text-[10px] font-body text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] opacity-30 block" />
                  Today
                </span>
                {COLOR_OPTIONS.filter(c => c.value !== "slate").map(c => (
                  <span key={c.value} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full block ${c.dot}`} />
                    {c.label.split(" ")[1]}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Add Event Form (inline) ────────────────────────────── */}
            {isHR() && showForm && (
              <div className="bg-white dark:bg-slate-800 border border-[var(--brand-primary)]/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-body">
                    New Event — <span className="text-[var(--brand-primary)]">{selLabel}</span>
                  </h3>
                </div>

                {formErr && (
                  <p className="text-[11px] text-rose-500 font-body">{formErr}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-body">Event Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Board Meeting"
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-body">Time *</label>
                    <input
                      type="text"
                      placeholder="10:00 - 11:00 AM"
                      value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-body">Location</label>
                    <input
                      type="text"
                      placeholder="Room A, Zoom, etc."
                      value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-body">Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="interview">Interview</option>
                      <option value="break">Break</option>
                      <option value="review">Review</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider font-body">Color</label>
                    <select
                      value={form.color}
                      onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                      className="w-full text-[12px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 font-body"
                    >
                      {COLOR_OPTIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => { setShowForm(false); setFormErr(""); }}
                    className="px-4 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-1.5 text-[11px] font-bold rounded-lg bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity font-body"
                  >
                    + Add Event
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Day Detail Panel ───────────────────────────────── */}
          <div className="space-y-4">

            {/* Selected Date Header */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-body">Selected Day</p>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}>
                    {selDate?.toLocaleDateString("en-US", { weekday: "long" })}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-body">
                    {selDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold font-display
                  ${selected === todayKey()
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}>
                  {selDate?.getDate()}
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg py-2 border border-slate-100 dark:border-slate-700/30">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">{dayEvents.length}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-body">Events</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg py-2 border border-slate-100 dark:border-slate-700/30">
                  <p className="text-lg font-bold text-[var(--brand-primary)] font-display">
                    {dayEvents.filter(e => e.type === "meeting" || e.type === "interview").length}
                  </p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-body">Meetings</p>
                </div>
              </div>
            </div>

            {/* Events list for selected day */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3 min-h-[260px]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-body">
                  Events
                </h3>
                {isHR() && (
                  <button
                    onClick={() => { setShowForm(true); setFormErr(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    title="Add event to this day"
                    className="w-6 h-6 rounded-full bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] transition-colors"
                  >
                    <Plus size={11} weight="bold" />
                  </button>
                )}
              </div>

              {dayEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <CalendarDots size={32} className="text-slate-300 dark:text-slate-600 mb-2" weight="duotone" />
                  <p className="text-[11px] text-slate-400 font-body">No events scheduled for this day.</p>
                  {isHR() && (
                    <button
                      onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="mt-3 text-[10px] text-[var(--brand-primary)] font-semibold hover:underline font-body"
                    >
                      + Add an event
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEvents.map(evt => (
                    <div
                      key={evt.id}
                      className={`pl-3 pr-2 py-2.5 border-l-2 rounded-r-lg flex items-start justify-between gap-2 group text-left ${colorBar(evt.color)}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                            {TYPE_ICONS[evt.type] || TYPE_ICONS.other}
                          </span>
                          <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {evt.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-body">
                            <Clock size={9} className="flex-shrink-0" />
                            {evt.time}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-body">
                              <MapPin size={9} className="flex-shrink-0" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                      {isHR() && (
                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="Delete event"
                          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 mt-0.5"
                        >
                          <Trash size={11} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming events (next 3 days) */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-body mb-3">
                Upcoming (Next 3 Days)
              </h3>
              {(() => {
                const upcoming = [];
                for (let d = 1; d <= 3; d++) {
                  const dk = seedDate(d);
                  const dEvts = eventsOn(dk);
                  if (dEvts.length > 0) {
                    const dt = new Date(dk + "T00:00:00");
                    upcoming.push({ label: dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), events: dEvts, dk });
                  }
                }
                if (upcoming.length === 0) {
                  return <p className="text-[11px] text-slate-400 font-body text-center py-3">No upcoming events in the next 3 days.</p>;
                }
                return upcoming.map(({ label, events: upEvts, dk: udk }) => (
                  <div key={udk} className="mb-3">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-body mb-1.5">{label}</p>
                    {upEvts.map(e => (
                      <button
                        key={e.id}
                        onClick={() => setSelected(e.date)}
                        className={`w-full text-left pl-2.5 pr-2 py-1.5 border-l-2 rounded-r text-[11px] mb-1 flex items-center gap-1.5 hover:opacity-90 transition-opacity ${colorBar(e.color)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorDot(e.color)}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{e.title}</span>
                        <span className="ml-auto text-[9px] text-slate-400 whitespace-nowrap font-body">{e.time.split(" - ")[0]}</span>
                      </button>
                    ))}
                  </div>
                ));
              })()}
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
