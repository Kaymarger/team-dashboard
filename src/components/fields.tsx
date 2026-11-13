import type { ReactNode } from "react";
import { agents } from "@/config/agents";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-8 w-full rounded-lg border border-white/15 bg-[#0e1a2b]/70 px-2 text-sm text-foreground outline-none [color-scheme:dark] focus-visible:border-[#294c7d] focus-visible:ring-2 focus-visible:ring-[#294c7d]/60";

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
      <span className="text-[0.68rem] font-medium text-[#c5c5c5]">{label}</span>
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
