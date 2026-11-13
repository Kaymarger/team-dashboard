import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { TeamBackground } from "@/components/team-background";
import { brand } from "@/config/brand";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: `${brand.group} team dashboard for dates, listings, and requests.`,
  robots: { index: false, follow: false },
  icons: { icon: brand.logo },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="relative min-h-full font-sans">
        <TeamBackground />
        {children}
      </body>
    </html>
  );
}
