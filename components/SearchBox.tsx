"use client";

import SubmitButton from "@/components/SubmitButton";
import { input, primaryButton } from "@/lib/styles";

/**
 * The search box on the product list.
 *
 * It is a plain GET form pointing at "/", so submitting reloads the list with
 * ?q=... in the address bar and it still works without JavaScript. Being a
 * client component only adds the pending state while the search runs.
 */
export default function SearchBox({ query }: { query: string }) {
  return (
    <form action="/" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="search" className="sr-only">
        Search products by name
      </label>
      <input
        id="search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Search products by name"
        autoComplete="off"
        className={input}
      />
      <SubmitButton pendingLabel="Searching..." className={`${primaryButton} sm:w-32`}>
        Search
      </SubmitButton>
    </form>
  );
}