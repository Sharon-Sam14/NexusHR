import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ placeholder = "Search...", onSearch, debounceMs = 300, className = "" }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  const clear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={15} className="absolute left-3 text-slate-500 pointer-events-none" />
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
          className="absolute right-3 text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
