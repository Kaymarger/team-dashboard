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
        className="rounded-full border border-[#e6e9f0] bg-white px-3 py-1.5 text-xs font-medium text-[#5c5c5c] shadow-sm transition hover:text-[#0e1a2b]"
      >
        Sign out
      </button>
    </form>
  );
}
