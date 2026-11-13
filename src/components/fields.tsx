import type { ReactNode } from "react";
import { agents } from "@/config/agents";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-10 w-full rounded-xl border border-[#e1e5ee] bg-white px-3 text-sm text-[#0e1a2b] outline-none focus-visible:border-[#294c7d] focus-visible:ring-2 focus-visible:ring-[#294c7d]/20";

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
      <span className="text-xs font-medium text-[#5c5c5c]">{label}</span>
      {children}
    </label>
  );
}

export function AgentField() {
  return (
    <Field label="Agent">
      <select name="agent" required defaultValue="" className={controlClass}>
        <option value="" disabled>
          Select
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
