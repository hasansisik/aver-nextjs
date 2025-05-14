import { AOSInit } from "@/app/_components/AosInit";
import DeviceSizeIndicator from "@/app/_components/DeviceSizeIndicator";
import config from "@/config/site.config.json";

import { Outfit } from "next/font/google";
const outfit = Outfit({
  weight: ["200", "300", "400", "500"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-outfit",
});

import localFont from "next/font/local";
const melodrama = localFont({
  src: "../../public/fonts/melodrama/Melodrama-Variable.woff2",
  fontFamily: "Melodrama",
  variable: "--font-melodrama",
});

// Import shadcn UI styles
import "@/app/globals.css";

export default function LoginLayout({ children }) {
  const deviceIndicator = config.settings.deviceIndicator;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${melodrama.variable} font-primary`}
    >
      <body className="bg-background text-foreground">
        <AOSInit />
        <DeviceSizeIndicator enable={deviceIndicator} />
        
        <main>
          {children}
        </main>
        
      </body>
    </html>
  );
} 