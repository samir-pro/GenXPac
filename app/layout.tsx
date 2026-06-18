import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "GenXPac — Import Chine vers Tunisie",
  description:
    "Plateforme B2B de pré-commande : importez des produits de Chine et vendez aux boutiques tunisiennes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
