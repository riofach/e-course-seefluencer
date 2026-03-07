"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { registerUser } from "~/server/actions/auth/register";
import {
  RegisterSchema,
  type RegisterInput,
} from "~/server/actions/auth/schemas";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { ActionResponse } from "~/types";

// -------------------------------------------------------------------
// SubmitButton — separate component so useFormStatus works correctly
// (useFormStatus must be inside a child of the <form>, not the same component)
// -------------------------------------------------------------------
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-indigo-600 hover:bg-indigo-700"
    >
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}

// -------------------------------------------------------------------
// RegisterForm — main client component
// -------------------------------------------------------------------
export function RegisterForm() {
  const router = useRouter();

  // useActionState: action signature is (prevState, formData) => Promise<State>
  const [serverState, formAction] = useActionState<
    ActionResponse | null,
    FormData
  >(registerUser, null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "" },
  });

  // Keep a ref to formAction for use in handleSubmit
  const formActionRef = useRef(formAction);
  formActionRef.current = formAction;

  // Handle server response side-effects (toasts + redirect)
  useEffect(() => {
    if (!serverState) return;

    if (serverState.success) {
      toast.success("Account created! Please log in.");
      router.push("/login");
    } else {
      toast.error(serverState.error);
    }
  }, [serverState, router]);

  // Hybrid: react-hook-form validates client-side, then hands off to server action
  const handleSubmit = form.handleSubmit((data: RegisterInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    startTransition(() => {
      formActionRef.current(formData);
    });
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Server-level error alert — also shown inline for UX (AC #4) */}
        {serverState && !serverState.success && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverState.error}
          </div>
        )}

        <form action={formAction} onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Name field (AC #1) */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className={cn(
                  "h-11",
                  form.formState.errors.name &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email field (AC #1, #4) */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={cn(
                  "h-11",
                  form.formState.errors.email &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password field (AC #1, #5) */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                className={cn(
                  "h-11",
                  form.formState.errors.password &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button with loading state (AC #6) */}
            <SubmitButton />
          </div>
        </form>

        {/* Link to login (AC #1 / UX spec) */}
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
