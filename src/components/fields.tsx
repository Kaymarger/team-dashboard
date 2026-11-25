"use client";

import { useState, type ReactNode } from "react";
import { agents } from "@/config/agents";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-12 w-full min-w-0 max-w-full rounded-xl border border-[#e6e1d8] bg-[#f7f6f3] px-3 text-base text-[#1c1c1c] outline-none transition duration-200 [color-scheme:light] placeholder:text-[#716c65] focus-visible:border-[#a8875a] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#a8875a]/45";

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
      <span className="text-sm font-medium text-[#1c1c1c]">{label}</span>
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
      <div role="radiogroup" className="flex flex-wrap gap-1 rounded-xl bg-[#f1efea] p-1">
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
                "min-h-11 flex-1 rounded-lg px-3 text-base leading-tight font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]",
                selected ? "bg-[#1f2326] text-white" : "text-[#3a3a3a] hover:bg-white hover:text-[#1c1c1c]",
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
