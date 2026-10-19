import type { Metadata } from "next";
import "./globals.css";
import { ImageGeneratorHeader } from "./image-generator-header";

export const metadata: Metadata = {
  title: "Image Generator | Social Income",
  description: "AI image generator by Social Income",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="bg-website-gradient text-primary flex min-h-screen flex-col antialiased">
        <ImageGeneratorHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
