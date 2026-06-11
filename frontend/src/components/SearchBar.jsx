import { useState, useEffect } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

export default function SearchBar({ placeholder = "Search...", onSearch, debounceMs = 300, className = "" }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  const clear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative flex items-center font-body ${className}`}>
      <MagnifyingGlass size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-8"
      />
      {value && (
        <button
          onClick={clear}
          className="absolute right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
