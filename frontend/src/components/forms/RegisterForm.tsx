"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { register as registerUser } from "@/redux/auth/authSlice";
import { registerSchema, type RegisterFormValues } from "@/validations/auth";
import { ROUTES } from "@/constants/routes";
import { AppInput } from "@/components/common/AppInput";
import { PasswordInput } from "@/components/common/PasswordInput";
import { AppButton } from "@/components/common/AppButton";

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...payload } = values;
    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      router.replace(ROUTES.DASHBOARD);
    } else {
      toast.error((result.payload as string) ?? "Registration failed");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-500">Join the project management workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput
            label="First name"
            placeholder="Bob"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <AppInput
            label="Last name"
            placeholder="Example"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <AppInput
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <p className="text-xs text-slate-500">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <AppButton type="submit" fullWidth loading={loading}>
          Create account
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-800">
          Sign in
        </Link>
      </p>
    </div>
  );
}
