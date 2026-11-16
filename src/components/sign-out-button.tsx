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
        className="inline-flex h-11 items-center rounded-full border border-[#e6e9f0] bg-white px-4 text-sm font-medium text-[#5c5c5c] shadow-sm transition hover:text-[#0e1a2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2"
      >
        Sign out
      </button>
    </form>
  );
}
