"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, signupAction } from "@/app/actions/auth-actions";
import { Button, Input, Label, Spinner } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      isLogin ? loginAction(formData) : signupAction(formData),
    {},
  );

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {isLogin
          ? "Log in to manage your invitations and RSVPs."
          : "Start designing beautiful invitations in minutes."}
      </p>

      <form action={action} className="mt-6 space-y-4">
        {!isLogin && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Your name" autoComplete="name" required />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={isLogin ? "Your password" : "At least 8 characters"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending} size="lg">
          {pending && <Spinner />}
          {isLogin ? "Log in" : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-rose-600 hover:text-rose-700">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-rose-600 hover:text-rose-700">
              Log in
            </Link>
          </>
        )}
      </p>

      {!isLogin && (
        <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-center text-xs text-zinc-500">
          Demo account: <span className="font-medium">demo@invitio.app</span> /{" "}
          <span className="font-medium">demo1234</span>
        </p>
      )}
    </div>
  );
}
