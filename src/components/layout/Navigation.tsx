import Link from "next/link";

export const sections = [
  { label: "Shop", href: "/shop/" },
  { label: "Afterhours", href: "/#drop" },
  { label: "The studio", href: "/#story" },
] as const;

export function Wordmark() {
  return (
    <Link href="/" aria-label="RORECLUB home" className="rc-wordmark">
      RORECLUB
    </Link>
  );
}
