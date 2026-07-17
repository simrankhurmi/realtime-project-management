"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/auth/authSlice";
import { loginSchema, type LoginFormValues } from "@/validations/auth";
import { ROUTES } from "@/constants/routes";
import { AppInput } from "@/components/common/AppInput";
import { PasswordInput } from "@/components/common/PasswordInput";
import { AppButton } from "@/components/common/AppButton";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      toast.success("Welcome back!");
      router.replace(ROUTES.DASHBOARD);
    } else {
      toast.error((result.payload as string) ?? "Login failed");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Internal Project Management System</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AppInput
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <AppButton type="submit" fullWidth loading={loading}>
          Sign in
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.REGISTER} className="font-medium text-indigo-600 hover:text-indigo-800">
          Create one
        </Link>
      </p>
    </div>
  );
}
