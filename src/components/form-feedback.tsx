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
      className="sticky bottom-0 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d4b483] px-4 text-sm font-semibold text-[#2b2f3e] shadow-[0_8px_24px_rgba(212,180,131,0.18)] transition hover:bg-[#e3c79a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] focus-visible:ring-offset-2 focus-visible:ring-offset-[#383d50] disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="flex flex-col items-center px-2 py-12 text-center" role="status">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#d4b483]/15 text-[#d4b483] ring-8 ring-[#d4b483]/10">
        <Check className="size-7" strokeWidth={2.4} aria-hidden />
      </span>
      <p className="mt-5 text-2xl font-light tracking-tight text-white">{message}</p>
      <p className="mt-1 text-sm text-[#b7b3ab]">The team has the request.</p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onAnother}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#d4b483] px-5 text-sm font-semibold text-[#2b2f3e] hover:bg-[#e3c79a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
        >
          Submit another
        </button>
        {close ? (
          <button
            type="button"
            onClick={close}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
