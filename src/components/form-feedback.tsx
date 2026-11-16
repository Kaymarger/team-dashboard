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
      className="sticky bottom-0 z-10 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1f2326] px-4 text-base font-semibold text-white shadow-[0_0_0_12px_#ffffff] transition hover:bg-[#33383c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="flex size-16 items-center justify-center rounded-full bg-[#f1efea] text-[#1f2326] ring-8 ring-[#f1efea]">
        <Check className="size-7" strokeWidth={2.4} aria-hidden />
      </span>
      <p className="mt-5 text-2xl font-light tracking-tight text-[#1c1c1c]">{message}</p>
      <p className="mt-1 text-sm text-[#716c65]">The team has the request.</p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onAnother}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1f2326] px-5 text-sm font-semibold text-white hover:bg-[#33383c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
        >
          Submit another
        </button>
        {close ? (
          <button
            type="button"
            onClick={close}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#d9d5cd] px-5 text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1efea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
          >
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
