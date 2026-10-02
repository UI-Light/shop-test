"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * The corner toast required by DESIGN.md: a short sentence that says what
 * just happened and disappears on its own after a few seconds.
 */

type Toast = {
  id: number;
  message: string;
  tone: "success" | "error";
};

type ShowToast = (message: string, tone?: "success" | "error") => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Called by any client component that wants to say something to the shopper. */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

const VISIBLE_FOR_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (message, tone = "success") => {
      // The id only has to be unique, not meaningful.
      const id = Date.now() + Math.random();
      // Keep at most three on screen so they never pile up.
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), VISIBLE_FOR_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}

      {/* Fixed to the corner of the screen, above everything else. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={
              "animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 " +
              "rounded-lg border px-4 py-3 text-sm shadow-lg " +
              (toast.tone === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-slate-200 bg-white text-slate-900")
            }
          >
            <span
              aria-hidden="true"
              className={
                "mt-1.5 size-2 shrink-0 rounded-full " +
                (toast.tone === "error" ? "bg-red-500" : "bg-violet-600")
              }
            />
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss message"
              className="-mr-1 -mt-0.5 rounded p-1 text-slate-500 transition duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}