"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, LockKeyhole, Mail } from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants/app";
import { ROUTES } from "@/lib/constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login-schema";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      workspaceName: "Sentient Workspace",
      email: "ana@alpineretail.com",
      password: "password123",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const session = await login(values);
    router.push(session.user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard);
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {APP_NAME}
            </p>
            <CardTitle className="mt-2 text-2xl text-white">Sign in to your workspace</CardTitle>
            <CardDescription className="mt-1">{APP_SUBTITLE}</CardDescription>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a1321] p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Demo access</p>
            <p className="mt-1">Use `admin@sentient.app` for admin access.</p>
            <p>Use any other email for a client workspace.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input id="workspaceName" className="pl-9" {...form.register("workspaceName")} />
              </div>
              <p className="text-sm text-rose-300">{form.formState.errors.workspaceName?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input id="email" className="pl-9" {...form.register("email")} />
              </div>
              <p className="text-sm text-rose-300">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input id="password" type="password" className="pl-9" {...form.register("password")} />
              </div>
              <p className="text-sm text-rose-300">{form.formState.errors.password?.message}</p>
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
