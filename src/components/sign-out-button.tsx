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
        className="inline-flex h-11 items-center rounded-full border border-[#e5e2dc] bg-white px-4 text-sm font-medium text-[#1c1c1c] transition hover:bg-[#f1efea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
      >
        Sign out
      </button>
    </form>
  );
}
