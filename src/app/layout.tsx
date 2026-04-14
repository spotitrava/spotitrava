import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotitrava - Sua música do Google Drive",
  description: "Acesse e ouça sua biblioteca de música do Google Drive com uma experiência premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-spotify-dark`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
