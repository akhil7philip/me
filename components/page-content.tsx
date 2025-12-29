"use client";

import { useEffect, useRef } from "react";

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className = "" }: PageContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animation on mount
    if (contentRef.current) {
      contentRef.current.classList.add("page-entering");
    }
  }, []);

  return (
    <div
      ref={contentRef}
      className={`page-content ${className}`}
    >
      {children}
    </div>
  );
}
