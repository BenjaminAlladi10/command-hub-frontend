import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

export function KeywordInput({
  id,
  value,
  onChange,
  describedBy,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  describedBy?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const word = draft.trim().toLowerCase();
    if (word && !value.includes(word)) onChange([...value, word]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
      {value.map((k) => (
        <span key={k} className="inline-flex items-center gap-1 rounded border border-border bg-muted py-0.5 pl-2 pr-1 font-mono text-xs">
          {k}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== k))}
            className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`Remove keyword ${k}`}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        aria-describedby={describedBy}
        placeholder={value.length ? "" : "Type a keyword and press Enter"}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
