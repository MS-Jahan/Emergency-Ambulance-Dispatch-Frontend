import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const schib = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dispatch - Emergency Ambulance Service",
  description: "Fast, reliable emergency ambulance dispatch in Dhaka",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${schib.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gauze text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
