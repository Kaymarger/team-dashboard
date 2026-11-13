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
      <div className="w-full max-w-md rounded-3xl border border-[#294c7d]/40 bg-white/[0.07] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Image
          src={brand.logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg bg-white object-contain p-1"
        />
        <p className="mt-4 text-xs font-medium tracking-[0.18em] text-[#9fb4d4] uppercase">
          {brand.name}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-medium tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {brand.group}. Enter the team password.
        </p>

        {setup ? (
          <p
            className="mt-4 rounded-2xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-sm text-amber-100"
            role="status"
          >
            Sign-in is not turned on yet. The password still needs to be saved
            on the website host.
          </p>
        ) : null}

        {invalid ? (
          <p
            className="mt-4 rounded-2xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-100"
            role="alert"
          >
            That password is not right. Try again.
          </p>
        ) : null}

        <form action={login} className="mt-5 flex flex-col gap-3">
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
              className="h-10 rounded-2xl border-white/12 bg-white/[0.07] px-3 text-base"
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
