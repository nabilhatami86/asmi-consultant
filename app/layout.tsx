import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "ASMI Consultant",
  description: "Konsultan AI untuk riset pasar parfum lokal Indonesia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
