import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import type { Procedure } from "@/types/Procedure";
import useApiCall from "@/hooks/useApiCall";

interface ProcedureSearchProps {
  onSelect: (p: Procedure) => void;
}

export default function ProcedureSearch({ onSelect }: ProcedureSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [] } = useApiCall<Procedure[]>({
    request: {
      endpoint: "/api/procedure",
      params: {
        search: encodeURIComponent(debouncedQuery)
      }
    },
    fetchOnMount: !!query
  });

  return (
    <div className="relative w-full">
      <Input
        placeholder="Search procedures..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {(results || []).length > 0 && !!query.trim() && (
        <ul className="absolute mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow z-20">
          {(results || []).map((p) => (
            <li
              key={p.procedureId}
              onClick={() => {
                onSelect(p);
                setQuery("");
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100">
              {p.procedureName} — ${p.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
