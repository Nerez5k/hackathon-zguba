import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { HeaderNav } from "@/components/layout/HeaderNav";

export const metadata: Metadata = {
  title: "Rejestr Rzeczy Znalezionych | dane.gov.pl",
  description: "Centralny system zgłaszania rzeczy znalezionych do rejestru publicznego.",
  keywords: ["rzeczy znalezione", "bip", "urząd", "dane.gov.pl"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gov-gray-light">
        <AuthProvider>
          <a href="#main-content" className="skip-link">
            Przejdź do treści
          </a>
          
          <header className="bg-white border-b border-gov-border shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-5">
              <HeaderNav />
            </div>
          </header>

          <main id="main-content" className="min-h-[calc(100vh-120px)]">
            {children}
          </main>

          <footer className="bg-gov-gray-light border-t border-gov-border py-6">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gov-text-light">
                <a href="/mapa" className="hover:underline">Mapa zgub</a>
                <a href="https://dane.gov.pl" target="_blank" rel="noopener noreferrer" className="hover:underline">dane.gov.pl</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
