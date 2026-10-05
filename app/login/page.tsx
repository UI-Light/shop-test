import { redirect } from "next/navigation";
import InstallPrompt from "@/components/InstallPrompt";
import SubmitButton from "@/components/SubmitButton";
import { signInWithGoogle } from "./actions";
import { safeNextPath } from "@/lib/safe-redirect";
import { primaryButton } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in",
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
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Use your Google account to shop and keep a cart.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </p>
      ) : null}

      <form action={signInWithGoogle} className="mt-8">
        <input type="hidden" name="next" value={nextPath} />
        <SubmitButton
          pendingLabel="Opening Google..."
          className={`${primaryButton} w-full`}
        >
          Continue with Google
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        The shop is only visible once you are signed in.
      </p>

      {/* Appears only once the browser says the shop can be installed. */}
      <InstallPrompt />
    </div>
  );
}
