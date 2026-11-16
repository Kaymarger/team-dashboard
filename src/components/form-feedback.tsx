"use client";

import { createContext, useContext } from "react";
import { Check, Loader2 } from "lucide-react";

export const CloseFormContext = createContext<(() => void) | null>(null);

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0e1a2b] px-4 text-sm font-semibold text-white transition hover:bg-[#294c7d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? "Sending…" : "Submit"}
    </button>
  );
}

export function SuccessState({
  message,
  onAnother,
}: {
  message: string;
  onAnother: () => void;
}) {
  const close = useContext(CloseFormContext);
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center" role="status">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/70">
        <Check className="size-7" aria-hidden />
      </span>
      <p className="mt-4 text-lg font-semibold tracking-tight text-[#0e1a2b]">{message}</p>
      <p className="mt-1 text-sm text-[#5c5c5c]">The team has the request.</p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onAnother}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0e1a2b] px-5 text-sm font-semibold text-white hover:bg-[#294c7d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2"
        >
          Submit another
        </button>
        {close ? (
          <button
            type="button"
            onClick={close}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#e1e5ee] bg-white px-5 text-sm font-semibold text-[#0e1a2b] hover:bg-[#f6f7f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2"
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
