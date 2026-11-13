"use client";

import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

export function SignOutButton() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <div className="relative z-30 flex justify-end px-4 pt-3">
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[0.7rem] text-[#c5c5c5] backdrop-blur transition hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
