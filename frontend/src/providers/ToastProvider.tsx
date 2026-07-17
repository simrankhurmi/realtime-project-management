"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: "text-sm",
        style: {
          background: "#1e293b",
          color: "#f8fafc",
        },
      }}
    />
  );
}
