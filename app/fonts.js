import { Outfit } from "next/font/google";
import localFont from "next/font/local";

export const outfit = Outfit({
  weight: ["200", "300", "400", "500"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const melodrama = localFont({
  src: "../public/fonts/melodrama/Melodrama-Variable.woff2",
  fontFamily: "Melodrama",
  variable: "--font-melodrama",
}); 