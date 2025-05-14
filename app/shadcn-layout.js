import { AOSInit } from "@/app/_components/AosInit";
import DeviceSizeIndicator from "@/app/_components/DeviceSizeIndicator";
import config from "@/config/site.config.json";
import { outfit, melodrama } from "@/app/fonts";

// Import shadcn UI styles instead of regular styles
import "@/app/globals.css";

export default function ShadcnLayout({ children }) {
  const deviceIndicator = config.settings.deviceIndicator;

  return (
    <>
      <AOSInit />
      <DeviceSizeIndicator enable={deviceIndicator} />
      <main className="bg-background text-foreground">
        {children}
      </main>
    </>
  );
} 