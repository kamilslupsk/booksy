import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Rezerwuj — umów wizytę online",
  description: "Prosta platforma do umawiania wizyt u fryzjerów, stylistów paznokci, trenerów i innych usługodawców.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col antialiased bg-gray-50 text-slate-800`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
