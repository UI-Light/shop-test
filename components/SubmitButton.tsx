"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that shows a pending state while its form is being sent:
 * disabled, with a small spinner and a different label ("Adding...").
 * DESIGN.md asks for this on every button that triggers an action.
 *
 * It has to sit inside a <form>, because useFormStatus reads the form it is in.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      {...rest}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}