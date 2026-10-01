import { redirect } from "next/navigation";
import { signInWithGoogle } from "./actions";
import { safeNextPath } from "@/lib/safe-redirect";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in · Shop",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const nextPath = safeNextPath(next);

  // Already signed in? Skip the login screen.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Use your Google account to shop and keep a cart.
      </p>

      {error ? (
        <p className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {error}
        </p>
      ) : null}

      <form action={signInWithGoogle} className="mt-8">
        <input type="hidden" name="next" value={nextPath} />
        <button type="submit" className={`${primaryButton} w-full`}>
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        The shop is only visible once you are signed in.
      </p>
    </main>
  );
}
