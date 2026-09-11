"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/error-panel";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return <ErrorPanel onRetry={retry} homeHref="/" homeLabel="Go home" />;
}
