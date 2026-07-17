"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProfile } from "@/redux/auth/authSlice";
import { setTokens } from "@/services/api/axios";
import { AUTH_COOKIE, REFRESH_COOKIE } from "@/constants/api";
import { getAuthCookie, setAuthCookie } from "@/utils/storage";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated } = useAppSelector((state) => state.auth);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const cookieAccess = getAuthCookie(AUTH_COOKIE);
    const cookieRefresh = getAuthCookie(REFRESH_COOKIE);

    if (cookieAccess) {
      setTokens(cookieAccess, cookieRefresh);
    }

    if (isAuthenticated && accessToken && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, accessToken, user]);

  useEffect(() => {
    if (accessToken) {
      setAuthCookie(AUTH_COOKIE, accessToken);
    }
  }, [accessToken]);

  return null;
}
