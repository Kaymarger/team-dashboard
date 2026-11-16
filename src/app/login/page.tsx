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
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#e6e9f0] bg-white p-8 shadow-[0_24px_70px_rgba(14,26,43,0.08)] sm:p-10">
        <Image
          src={brand.logo}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
        <p className="mt-6 text-sm font-medium text-[#294c7d]">{brand.name}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-[#0e1a2b]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5c5c5c]">
          {brand.group}. Enter the shared team password to open the dashboard.
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
              placeholder="Team password"
              className="h-12 rounded-xl border-[#e1e5ee] bg-white px-3 text-base text-[#0e1a2b]"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-12 w-full rounded-xl text-sm font-semibold")}
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
