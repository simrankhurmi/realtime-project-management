"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { hydrateAuth } from "@/redux/auth/authSlice";
import { setTokens } from "@/services/api/axios";
import { ROUTES } from "@/constants/routes";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (auth.accessToken && auth.refreshToken) {
      setTokens(auth.accessToken, auth.refreshToken);
    }
  }, [auth.accessToken, auth.refreshToken]);

  const requireAuth = () => {
    if (!auth.isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return false;
    }
    return true;
  };

  return { ...auth, requireAuth, hydrateAuth: (payload: Parameters<typeof hydrateAuth>[0]) => dispatch(hydrateAuth(payload)) };
}
