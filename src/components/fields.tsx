"use client";

import { useState, type ReactNode } from "react";
import { agents } from "@/config/agents";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-12 w-full rounded-xl border border-white/10 bg-[#2b2f3e] px-3 text-sm text-[#f7f5f2] outline-none transition [color-scheme:dark] placeholder:text-[#8d918c] focus-visible:border-[#d4b483] focus-visible:ring-2 focus-visible:ring-[#d4b483]/40";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-sm font-medium text-[#f7f5f2]">{label}</span>
      {children}
    </label>
  );
}

export function AgentField() {
  return (
    <Field label="Agent">
      <select name="agent" required defaultValue="" className={controlClass}>
        <option value="" disabled>
          Select an agent
        </option>
        {agents.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function SegmentedChoices({
  name,
  options,
  value,
  onChange,
  required,
}: {
  name: string;
  options: readonly string[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  const [internal, setInternal] = useState("");
  const current = value !== undefined ? value : internal;

  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div>
      <input type="hidden" name={name} value={current} required={required} />
      <div role="radiogroup" className="flex flex-wrap gap-1 rounded-xl bg-[#2b2f3e] p-1">
        {options.map((option) => {
          const selected = current === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(option)}
              className={cn(
                "min-h-10 flex-1 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]",
                selected ? "bg-[#d4b483] text-[#2b2f3e]" : "text-[#c9c6bf] hover:bg-white/5 hover:text-white",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
