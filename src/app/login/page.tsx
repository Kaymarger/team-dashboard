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
      <div className="w-full max-w-[420px] rounded-2xl border border-[#e6e1d8] bg-white p-8 shadow-[0_20px_50px_rgba(28,28,28,0.08)] sm:p-10">
        <Image
          src={brand.logo}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-2xl border border-[#e6e1d8] bg-[#f6f3ee] object-contain p-1.5"
        />
        <p className="mt-6 text-[0.68rem] font-semibold tracking-[0.16em] text-[#876c47] uppercase">{brand.name}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1c1c1c]">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#716c65]">
          {brand.group}. Enter the shared team password to open the dashboard.
        </p>

        {setup ? (
          <p className="mt-5 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b3a2e]" role="status">
            Sign-in is not turned on yet. The password still needs to be saved on the website host.
          </p>
        ) : null}

        {invalid ? (
          <p className="mt-5 rounded-2xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b3a2e]" role="alert">
            That password is not right. Try again.
          </p>
        ) : null}

        <form action={login} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[#1c1c1c]">
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
              className="h-12 rounded-xl border-[#e6e1d8] bg-[#f7f6f3] px-3 text-base text-[#1c1c1c] placeholder:text-[#716c65] focus-visible:border-[#a8875a] focus-visible:bg-white focus-visible:ring-[#a8875a]/45 md:text-base"
            />
          </div>
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#1c1c1c] text-sm font-semibold text-white transition hover:bg-[#2c2c2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
