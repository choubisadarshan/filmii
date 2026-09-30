"use client";

import React, { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

export interface WebGLErrorBoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebGL Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function WebGLFallback({
  className,
  message = "This carousel needs WebGL, which is unavailable in this browser.",
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-neutral-950 p-6 text-center text-neutral-400 border border-white/10 rounded-2xl",
        className
      )}
    >
      <p className="font-mono text-xs uppercase tracking-wider">{message}</p>
    </div>
  );
}
