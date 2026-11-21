import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rore Club — The Drop Room",
  description:
    "Original manga and comic-inspired merch from Rore Club. Explore the Afterhours collection and find a piece of your universe.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
