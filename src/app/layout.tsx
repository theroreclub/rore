import type { Metadata } from "next";
import type { ReactNode } from "react";
import { editorial, ui } from "@/design/fonts";
import { MotionPolicy } from "@/design/MotionPolicy";
import { Storefront } from "@/components/layout/Storefront";
import { conceptCatalog } from "@/lib/catalog";
import "./globals.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Rore Club — The Drop Room",
  description:
    "Explore RORECLUB’s graphic streetwear collection. A closer look at the ink, silhouettes, and stories behind each piece.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${editorial.variable} ${ui.variable}`}>
      <body>
        <MotionPolicy>
          <Storefront products={conceptCatalog}>{children}</Storefront>
        </MotionPolicy>
      </body>
    </html>
  );
}
