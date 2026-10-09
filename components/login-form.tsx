"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button, Field, Input } from "@/components/ui/primitives";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email">
        <Input name="email" type="email" autoComplete="username" inputMode="email" placeholder="you@bluedoorbuilding.com" required />
      </Field>
      <Field label="Access code">
        <Input name="code" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </Field>
      {state?.error ? <p className="rounded-xl bg-danger-soft px-3 py-2 text-xs font-medium text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
