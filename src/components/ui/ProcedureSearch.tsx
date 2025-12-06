import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import type { Procedure } from "@/types/Procedure";

interface ProcedureSearchProps {
  onSelect: (p: Procedure) => void;
}

export default function ProcedureSearch({ onSelect }: ProcedureSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Procedure[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchProcedures = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      const res = await fetch(
        `/api/procedures?search=${encodeURIComponent(debouncedQuery)}&limit=10`
      );
      const json = await res.json();
      setResults(json.data || []);
    };

    fetchProcedures();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full">
      <Input
        placeholder="Search procedures..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <ul className="absolute mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow z-20">
          {results.map((p) => (
            <li
              key={p.procedureId}
              onClick={() => {
                onSelect(p);
                setQuery("");
                setResults([]);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100"
            >
              {p.procedureName} — ${p.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
