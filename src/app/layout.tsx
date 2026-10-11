import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkinScanProvider } from "@/context/SkinScanContext";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { APP_NAME, APP_TAGLINE } from "@/lib/version";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} | ${APP_TAGLINE}`,
  description: "Next-Generation AI Skin Analysis & Virtual Skincare Try-On for the YouCam API Hackathon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <SkinScanProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </SkinScanProvider>
      </body>
    </html>
  );
}
