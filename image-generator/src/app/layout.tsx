import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@socialincome/design-system/navigation/site-footer/site-footer";
import "./globals.css";
import { ImageGeneratorHeader } from "./image-generator-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Generator | Social Income",
  description: "AI image generator by Social Income",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-website-gradient text-primary flex min-h-screen flex-col antialiased">
        <ImageGeneratorHeader />
        <div className="flex flex-1 flex-col pt-18 lg:pt-22">{children}</div>
        <SiteFooter
          copyright="© 2026 Social Income. All rights reserved."
          groups={[
            {
              id: "about",
              label: "About",
              links: [
                {
                  href: "/en/usd/about-us/team",
                  id: "team",
                  label: "Team",
                },
                {
                  href: "/en/usd/about-us/finances",
                  id: "finances",
                  label: "Finances",
                },
                {
                  href: "/en/usd/faq",
                  id: "faq",
                  label: "FAQ",
                },
              ],
            },
            {
              id: "contact",
              label: "Contact",
              links: [
                {
                  href: "/en/usd/newsletter",
                  icon: "newsletter",
                  id: "newsletter",
                  label: "Newsletter",
                },
                {
                  href: "/en/usd/contact",
                  icon: "contact",
                  id: "contact",
                  label: "Contact",
                },
              ],
            },
            {
              id: "social",
              label: "Follow us",
              links: [
                {
                  href: "https://instagram.com",
                  icon: "instagram",
                  id: "instagram",
                  label: "Instagram",
                  newTab: true,
                },
                {
                  href: "https://linkedin.com",
                  icon: "linkedin",
                  id: "linkedin",
                  label: "LinkedIn",
                  newTab: true,
                },
                {
                  href: "https://github.com/socialincome-san/public",
                  icon: "github",
                  id: "github",
                  label: "GitHub",
                  newTab: true,
                },
              ],
            },
            {
              id: "apps",
              label: "Apps",
              links: [
                {
                  href: "https://apps.apple.com",
                  icon: "appstore",
                  id: "appstore",
                  label: "App Store",
                  newTab: true,
                },
                {
                  href: "https://play.google.com",
                  icon: "googleplay",
                  id: "googleplay",
                  label: "Google Play",
                  newTab: true,
                },
              ],
            },
          ]}
        />
      </body>
    </html>
  );
}
