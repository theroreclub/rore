import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

export const editorial = Instrument_Serif({
  weight: "400", subsets: ["latin"], display: "swap", variable: "--font-editorial",
});

export const ui = localFont({
  src: [
    { path: "../../public/fonts/dm-sans-400-normal.woff2", weight: "400" },
    { path: "../../public/fonts/dm-sans-600-normal.woff2", weight: "600" },
  ],
  display: "swap", variable: "--font-ui",
});
