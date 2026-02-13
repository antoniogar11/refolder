import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Refolder — Presupuestos de reforma con IA en 2 minutos",
  description: "Describe tu reforma y la IA genera el presupuesto desglosado con precios reales. Exporta un PDF profesional con tu logo. Para autónomos y empresas de construcción en España.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
