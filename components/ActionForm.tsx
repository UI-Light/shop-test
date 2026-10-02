"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";
import { initialActionState, type ActionState } from "@/lib/action-state";

/** The shape a server action must have to be used in an ActionForm. */
type CartAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Wraps a server action in a <form> and turns whatever the action returns
 * into a corner toast. Use it for actions that stay on the same page
 * (add to cart, change quantity, remove) so the shopper gets told what
 * happened without the page jumping.
 *
 * Actions that redirect afterwards, like checkout, can use a plain <form>.
 */
export default function ActionForm({
  action,
  successMessage,
  errorMessage,
  className,
  children,
}: {
  action: CartAction;
  /** Overrides the message the action returned. */
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const showToast = useToast();

  // Only announce a result once, even if the same sentence comes back twice.
  const announced = useRef<ActionState>(initialActionState);

  useEffect(() => {
    if (state === announced.current) return;
    announced.current = state;

    if (state.status === "success") {
      showToast(successMessage ?? state.message, "success");
    } else if (state.status === "error") {
      showToast(errorMessage ?? state.message, "error");
    }
  }, [state, showToast, successMessage, errorMessage]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}