import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-bold tracking-tight text-zinc-900">
        Invitio<span className="text-rose-600">.</span>
      </Link>
      <AuthForm mode="signup" />
      <Link href="/" className="mt-8 text-sm text-zinc-400 hover:text-zinc-600">
        ← Back to home
      </Link>
    </div>
  );
}
