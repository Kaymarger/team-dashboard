import { createHmac, timingSafeEqual } from "node:crypto";

export const TEAM_SESSION_COOKIE = "areg_team_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const MIN_PASSWORD_LENGTH = 8;

function hmac(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("base64url");
}

function fixedEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Shared sign-in password from the host. Never log or commit this value. */
export function teamPassword(): string | null {
  const value = process.env.TEAM_PASSWORD?.trim() ?? "";
  if (value.length < MIN_PASSWORD_LENGTH) return null;
  return value;
}

export function passwordsMatch(input: string, expected: string): boolean {
  return fixedEqual(
    hmac("areg-team-password-check", input),
    hmac("areg-team-password-check", expected),
  );
}

export function createSessionValue(password: string, now = Date.now()): string {
  const exp = now + SESSION_TTL_MS;
  const payload = `v1.${exp}`;
  return `${payload}.${hmac(password, payload)}`;
}

export function isValidSession(
  token: string | undefined,
  password: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expText, signature] = parts;
  if (version !== "v1" || !expText || !signature) return false;
  if (!/^\d+$/.test(expText)) return false;
  const exp = Number(expText);
  if (!Number.isFinite(exp) || exp <= now) return false;
  return fixedEqual(signature, hmac(password, `v1.${expText}`));
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Only same-site paths. Blocks open redirects. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value.includes("://") || value.includes("\\")) return "/";
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/login/")) {
    return "/";
  }
  return value;
}
