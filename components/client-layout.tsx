"use client";

import { useEffect } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // VSCode initialization is handled on the client side only
    document.body.classList.add("vsc-initialized");
  }, []);

  return children;
}