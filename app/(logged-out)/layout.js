import { AOSInit } from "@/app/_components/AosInit";
import DeviceSizeIndicator from "@/app/_components/DeviceSizeIndicator";
import config from "@/config/site.config.json";
import { outfit, melodrama } from "@/app/fonts";

import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
// Import styles directly here for logged-out pages
import "@/styles/styles.scss";

// The metadata in this file will be the default - can be overridden by page metadata
// via generateMetadata function
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
  }
};

const AverApp = ({ children }) => {
  const deviceIndicator = config.settings.deviceIndicator;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${melodrama.variable} font-primary`}
      suppressHydrationWarning
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