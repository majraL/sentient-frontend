import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants/app";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_SUBTITLE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07101d] text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
