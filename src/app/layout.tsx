import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Rede Imobiliária Olivia Prado",
  description: "Encontre seu imóvel dos sonhos com a Olivia Prado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <div className="main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
