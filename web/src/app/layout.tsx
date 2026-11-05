import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600"] });
const barlowCondensed = Barlow_Condensed({ variable: "--font-barlow-condensed", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  title: "gym_app",
  description: "Rutinas y progreso con tu entrenador",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Casi todas las páginas leen la sesión (cookies): se renderizan por petición. */}
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
