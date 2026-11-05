import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "gym_app",
  description: "Rutinas y progreso con tu entrenador",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Casi todas las páginas leen la sesión (cookies): se renderizan por petición. */}
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
