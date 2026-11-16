"use client";

import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

export function SignOutButton() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-full border border-white/15 bg-[#383d50] px-4 text-sm font-medium text-[#f7f5f2] transition hover:text-[#d4b483] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2b2f3e]"
      >
        Sign out
      </button>
    </form>
  );
}
