"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui";

export function HeaderNav() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center justify-between font-sans">
      <a href="/" className="flex items-center gap-4 group">
        <div className="hidden sm:flex flex-col items-start border-r border-gov-border pr-4">
           <span className="text-2xl font-black text-gov-red leading-none">dane.gov.pl</span>
           <span className="text-[10px] uppercase tracking-widest text-gov-text-light">Otwarte Dane</span>
        </div>

        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-gov-blue group-hover:underline decoration-2 underline-offset-4">
            Rejestr Rzeczy Znalezionych
          </h1>
          <p className="text-xs sm:text-sm text-gov-text-light">
            Centralna baza zgub i znalezisk
          </p>
        </div>
      </a>
      
      <nav className="hidden md:flex items-center gap-6">
        <a 
          href="/mapa" 
          className="text-sm font-bold text-gov-text hover:text-gov-blue hover:underline decoration-2 underline-offset-4 transition-colors"
        >
          Mapa zgub
        </a>
        <a 
          href="/api-docs" 
          className="text-sm font-bold text-gov-text hover:text-gov-blue hover:underline decoration-2 underline-offset-4 transition-colors"
        >
          API
        </a>
        
        {isAuthenticated && (
          <>
            <a 
              href="/lista" 
              className="text-sm font-bold text-gov-text hover:text-gov-blue hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Lista spraw
            </a>
            <a 
              href="/eksport" 
              className="text-sm font-bold text-gov-text hover:text-gov-blue hover:underline decoration-2 underline-offset-4 transition-colors"
            >
              Eksport danych
            </a>
          </>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gov-border">
            <div className="text-right">
              <p className="text-sm font-bold text-gov-text">
                {user?.imie} {user?.nazwisko}
              </p>
              <p className="text-xs text-gov-text-light uppercase tracking-wide">
                {user?.urzad.powiat}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="border-gov-border text-gov-text hover:bg-gov-gray-light">
              Wyloguj
            </Button>
          </div>
        ) : (
          <a href="/">
            <Button variant="primary" size="sm" className="shadow-sm font-bold">
              Panel Urzędnika
            </Button>
          </a>
        )}
      </nav>

      <div className="md:hidden flex items-center gap-3">
        {isAuthenticated && (
          <div className="flex flex-col items-end mr-2">
             <span className="text-xs font-bold text-gov-text">{user?.imie}</span>
             <span className="text-[10px] text-gov-text-light uppercase">{user?.urzad.powiat}</span>
          </div>
        )}
        <a href="/mapa" className="p-2 text-gov-blue font-bold border border-gov-blue rounded hover:bg-gov-blue hover:text-white transition-colors">
          Mapa
        </a>
        {isAuthenticated && (
            <button onClick={logout} className="text-xs text-gov-text-light underline">Wyloguj</button>
        )}
      </div>
    </div>
  );
}
