"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxOption {
  value: string;
  label: string;
  prefix?: string; // emoji ou texte avant le label
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  // Fermer si clic à l'extérieur
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((p) => !p);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
          disabled && "cursor-not-allowed opacity-50",
          !selected && "text-zinc-400"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.prefix && (
                <span className="text-base leading-none">{selected.prefix}</span>
              )}
              <span className="text-zinc-900">{selected.label}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn(
            "text-zinc-400 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-100 bg-white shadow-lg shadow-zinc-100/60 overflow-hidden">
          {/* Recherche */}
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
            <Search size={13} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>

          {/* Liste */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-400 text-center">
                Aucun résultat
              </li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors",
                    option.value === value
                      ? "bg-zinc-50 text-zinc-900 font-medium"
                      : "text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    {option.prefix && (
                      <span className="text-base leading-none">{option.prefix}</span>
                    )}
                    {option.label}
                  </span>
                  {option.value === value && (
                    <Check size={13} strokeWidth={2} className="text-black shrink-0" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
