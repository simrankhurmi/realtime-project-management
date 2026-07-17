"use client";

import { ReduxProvider } from "./ReduxProvider";
import { ToastProvider } from "./ToastProvider";
import { AuthBootstrap } from "./AuthBootstrap";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthBootstrap />
      {children}
      <ToastProvider />
    </ReduxProvider>
  );
}
