import { AOSInit } from "@/app/_components/AosInit";
import DeviceSizeIndicator from "@/app/_components/DeviceSizeIndicator";
import { ReduxProvider } from "@/app/_components/ReduxProvider";
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
  }
};

export default function RootLayout({ children }) {
  const deviceIndicator = config.settings.deviceIndicator;

  // Using a static language attribute to avoid hydration mismatch
  // This ensures the server and client render the same language
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${melodrama.variable} font-primary`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AOSInit />
        <DeviceSizeIndicator enable={deviceIndicator} />
        <ReduxProvider>
          <StyleWrapper>
            {children}
          </StyleWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
} 