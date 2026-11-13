import type { Metadata } from "next";
import Image from "next/image";
import { login } from "@/app/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/config/brand";
import { safeNextPath } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(14,26,43,0.08)] ring-1 ring-[#0e1a2b]/5">
        <Image
          src={brand.logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
        <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[#294c7d] uppercase">
          {brand.name}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[#0e1a2b]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[#5c5c5c]">
          {brand.group}. Enter the team password.
        </p>

        {setup ? (
          <p
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            role="status"
          >
            Sign-in is not turned on yet. The password still needs to be saved
            on the website host.
          </p>
        ) : null}

        {invalid ? (
          <p
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            That password is not right. Try again.
          </p>
        ) : null}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              className="h-11 rounded-xl border-[#e1e5ee] bg-white px-3 text-base text-[#0e1a2b]"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-10 w-full rounded-2xl text-sm")}
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
