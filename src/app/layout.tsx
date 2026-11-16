import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TeamBackground } from "@/components/team-background";
import { brand } from "@/config/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="relative min-h-full font-sans">
        <TeamBackground />
        {children}
      </body>
    </html>
  );
}
