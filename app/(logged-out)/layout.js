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
  src: "../public/fonts/melodrama/Melodrama-Variable.woff2",
  fontFamily: "Melodrama",
  variable: "--font-melodrama",
});

import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "@/styles/styles.scss";

export const metadata = {
  title: config.metaData.title,
  description: config.metaData.description,
  siteName: config.metaData.title,
  url: config.baseURL,
  type: "website",

  icons: {
    icon: config.favicon,
  },

  metadataBase: new URL(config.baseURL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    images: config.metaData.ogImage,
  },
};

const AverApp = ({ children }) => {
  const deviceIndicator = config.settings.deviceIndicator;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${melodrama.variable} font-primary`}
    >
      <body>
        <AOSInit />
        <DeviceSizeIndicator enable={deviceIndicator} />

        <Header />
        <main className="bg-dark relative z-10 pt-[92px] lg:pt-[106px] min-h-[82vh]">
          {children}
        </main>
        <Footer />

      </body>
    </html>
  );
}
export default AverApp;