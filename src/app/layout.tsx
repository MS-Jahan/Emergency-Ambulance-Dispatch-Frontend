import type { Metadata } from "next";
import { Caprasimo, Figtree } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const caprasimo = Caprasimo({
  variable: "--font-caprasimo",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RapidAid — Emergency Ambulance Dispatch",
    template: "%s | RapidAid",
  },
  description:
    "Fast, reliable 24/7 nationwide emergency ambulance dispatch across Bangladesh. 3 taps to request, live GPS tracking, and post-trip digital payments.",
  openGraph: {
    title: "RapidAid — Emergency Ambulance Dispatch Platform",
    description:
      "Rapid emergency ambulance response and tracking across Bangladesh.",
    siteName: "RapidAid Dispatch",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${caprasimo.variable} h-full antialiased`}>
      <head>
        {/* Apply the persisted theme before first paint — kills the light
            flash on reload and carries dark mode to every route. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=JSON.parse(localStorage.getItem('ui-storage')||'{}').state;if(s&&s.theme==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gauze text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
