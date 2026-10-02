"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A header or footer link that knows whether it is the page you are on.
 * The current page is shown in violet so you always know where you are.
 */
export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={
        "rounded-md px-2 py-1 text-sm transition duration-150 ease-out " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 " +
        (isCurrent
          ? "font-medium text-violet-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900")
      }
    >
      {children}
    </Link>
  );
}