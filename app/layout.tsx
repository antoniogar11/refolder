import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Refolder — Presupuestos de reforma e instalaciones con IA en 2 minutos",
  description: "Describe tu reforma o instalación y la IA genera el presupuesto desglosado con precios reales. Para autónomos de reformas, fontanería, electricidad, climatización y empresas de construcción en España.",
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
