import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artigiani - Das Natürliche Eis",
  description: "Unsere Eissorten mit Preisen und Allergeninformationen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
