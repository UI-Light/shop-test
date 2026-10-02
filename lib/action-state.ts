/**
 * What a server action hands back to the browser.
 *
 * The action sets a status and a short sentence; the form around it shows
 * that sentence as a toast. `idle` is the starting value, so nothing is shown
 * until the shopper does something.
 */
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/** The value a form starts with, before the shopper has clicked anything. */
export const initialActionState: ActionState = { status: "idle", message: "" };