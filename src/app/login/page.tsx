import type { Metadata } from "next";
import Image from "next/image";
import { login } from "@/app/login/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/config/brand";
import { safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; setup?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const setup = params.setup === "1";
  const invalid = params.error === "1";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-[#383d50] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
        <Image
          src={brand.logo}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-2xl bg-white object-contain p-1.5"
        />
        <p className="mt-6 text-sm text-[#d4b483]">{brand.name}</p>
        <h1 className="mt-1 text-4xl font-light tracking-tight text-white">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#b7b3ab]">
          {brand.group}. Enter the shared team password to open the dashboard.
        </p>

        {setup ? (
          <p className="mt-5 rounded-2xl bg-[#4a4038] px-3 py-2 text-sm text-[#f0d7c4]" role="status">
            Sign-in is not turned on yet. The password still needs to be saved on the website host.
          </p>
        ) : null}

        {invalid ? (
          <p className="mt-5 rounded-2xl bg-[#4a4038] px-3 py-2 text-sm text-[#f0d7c4]" role="alert">
            That password is not right. Try again.
          </p>
        ) : null}

        <form action={login} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[#f7f5f2]">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              placeholder="Team password"
              className="h-12 rounded-xl border-white/10 bg-[#2b2f3e] px-3 text-base text-white placeholder:text-[#8d918c]"
            />
          </div>
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#d4b483] text-sm font-semibold text-[#2b2f3e] hover:bg-[#e3c79a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] focus-visible:ring-offset-2 focus-visible:ring-offset-[#383d50]"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
