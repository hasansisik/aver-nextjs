import { AOSInit } from "@/app/_components/AosInit";
import DeviceSizeIndicator from "@/app/_components/DeviceSizeIndicator";
import config from "@/config/site.config.json";
import { outfit, melodrama } from "@/app/fonts";
import StyleWrapper from "./style-wrapper";

// We'll handle styles in the individual page components
// import "@/styles/styles.scss";

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

export default function RootLayout({ children }) {
  const deviceIndicator = config.settings.deviceIndicator;

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${melodrama.variable} font-primary`}
    >
      <body>
        <AOSInit />
        <DeviceSizeIndicator enable={deviceIndicator} />
        <StyleWrapper>
          {children}
        </StyleWrapper>
      </body>
    </html>
  );
} 