import Link from "next/link";

export const sections = [
  { label: "Collection", href: "/#drop" },
  { label: "Universes", href: "/#universes" },
  { label: "Club notes", href: "/#notes" },
] as const;

export function Wordmark() {
  return (
    <Link href="/" aria-label="RORECLUB home" className="rc-wordmark">
      RORECLUB
    </Link>
  );
}
