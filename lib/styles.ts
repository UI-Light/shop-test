/**
 * DESIGN.md is the source of truth for the look. These are the class strings
 * used in more than one place, so a button looks the same on every page.
 * Light theme only: white surfaces, slate text, one violet accent.
 */

/** The one primary style: violet, rounded-lg, hover and focus states. */
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 " +
  "text-sm font-medium text-white transition duration-150 ease-out " +
  "hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-60";

/** Secondary actions: outline, for anything that is not the main button. */
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 " +
  "bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-150 ease-out " +
  "hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-60";

/** A violet text link that is not a button. */
export const textLink =
  "font-medium text-violet-600 underline-offset-4 transition duration-150 ease-out " +
  "hover:text-violet-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-violet-600";

/** Product cards: rounded-xl, hairline border, lift on hover only. */
export const card =
  "rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out " +
  "hover:-translate-y-0.5 hover:shadow-md";

/** Text inputs and the search box. */
export const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-500 transition duration-150 ease-out " +
  "hover:border-slate-400 focus:border-violet-600 focus:outline-2 focus:outline-offset-0 " +
  "focus:outline-violet-600/40";
