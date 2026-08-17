"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIp, rateLimitMessage } from "@/lib/rate-limit";

type ActionResult = { error?: string };

export async function signupAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const ip = await clientIp();
  const signupLimit = await checkRateLimit("signup", ip);
  if (!signupLimit.ok) return { error: rateLimitMessage(signupLimit.retryAfterSeconds) };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists. Try logging in." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  // Accept any pending collaborator invites for this email.
  await prisma.collaborator.updateMany({
    where: { email, userId: null },
    data: { userId: user.id, status: "accepted" },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Something went wrong. Please try again." };
    throw error; // re-throw redirects
  }
  return {};
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Key on both IP and email so a brute force is throttled per account as well
  // as per source.
  const ip = await clientIp();
  const loginLimit = await checkRateLimit("login", `${ip}:${email}`);
  if (!loginLimit.ok) return { error: rateLimitMessage(loginLimit.retryAfterSeconds) };

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
  return {};
}
