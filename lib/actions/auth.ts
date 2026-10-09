"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, clearSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { resetDemo } from "@/lib/db/seed";
import { str } from "@/lib/utils";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = str(formData.get("email")).toLowerCase();
  const code = str(formData.get("code"));
  if (!email || !code) return { error: "Enter your email and access code." };
  const user = await authenticate(email, code);
  if (!user) return { error: "That email and access code do not match." };
  // Demo mode: every sign-in rebuilds the sample data so it can be played with freely.
  if (process.env.DEMO_RESET_ON_LOGIN !== "false") {
    const db = await getDb();
    await resetDemo(db);
    const fresh = await authenticate(email, code);
    if (!fresh) return { error: "Sign-in failed after reset. Try again." };
    await createSession(fresh.id);
  } else {
    await createSession(user.id);
  }
  redirect("/today");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
