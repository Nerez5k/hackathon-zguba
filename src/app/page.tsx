"use client";

import { useState } from "react";
import Wizard from "@/components/wizard/Wizard";
import { Button, Card } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/lib/auth";
import type { RzeczZnaleziona } from "@/lib/types";

function DashboardContent() {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  const handleSubmit = async (data: RzeczZnaleziona) => {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save item");
    }

    return response.json();
  };

  if (showWizard) {
    return (
      <div className="py-8 px-4 bg-gov-gray-light min-h-[calc(100vh-200px)]">
        <Wizard onSubmit={handleSubmit} />
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gov-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 p-6 bg-gov-blue-light border-l-4 border-gov-blue rounded-r-sm shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gov-blue-dark">
              Dzień dobry, {user?.imie} {user?.nazwisko}
            </h2>
            <p className="text-gov-text text-sm mt-1 font-medium">
              {user?.urzad.nazwa} | {user?.urzad.powiat}
            </p>
          </div>
          <div className="text-right hidden sm:block">
             <span className="text-xs text-gov-text-light uppercase tracking-widest font-bold">Panel Urzędnika</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white border border-gov-border p-8 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-gov-black mb-4 border-b border-gov-border pb-2">
                        Rejestracja nowej rzeczy
                    </h3>
                    <p className="text-gov-text mb-6 leading-relaxed">
                        Uruchom procedurę dodawania nowej rzeczy znalezionej do rejestru centralnego. 
                        Formularz przeprowadzi Cię przez wymagane ustawowo kroki: kategoryzację, opis, lokalizację oraz wybór urzędu właściwego.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setShowWizard(true)}
                        className="w-full sm:w-auto font-bold text-base px-8 py-3"
                    >
                        + Rozpocznij nową procedurę
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <a href="/lista" className="block group">
                        <div className="bg-gov-gray-light border border-gov-border p-6 h-full hover:bg-white hover:border-gov-blue transition-all">
                            <h4 className="font-bold text-gov-blue mb-2 group-hover:underline decoration-2 underline-offset-4">Przeglądaj rejestr</h4>
                            <p className="text-sm text-gov-text">Zarządzaj listą rzeczy dodanych przez Twój urząd. Edytuj statusy i dane.</p>
                        </div>
                    </a>
                    <a href="/eksport" className="block group">
                        <div className="bg-gov-gray-light border border-gov-border p-6 h-full hover:bg-white hover:border-gov-blue transition-all">
                            <h4 className="font-bold text-gov-blue mb-2 group-hover:underline decoration-2 underline-offset-4">Eksport danych</h4>
                            <p className="text-sm text-gov-text">Pobierz dane w formatach XML/CSV/JSON zgodnych ze standardem dane.gov.pl.</p>
                        </div>
                    </a>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gov-success-light border border-gov-success p-5">
                     <h4 className="font-bold text-gov-success mb-3 text-sm uppercase tracking-wide">Aktualne wytyczne prawne</h4>
                     <ul className="space-y-3 text-sm text-gov-black">
                        <li className="flex justify-between border-b border-gov-success/20 pb-1">
                            <span>Odbiór (bud. publ.):</span>
                            <span className="font-bold">30 dni</span>
                        </li>
                        <li className="flex justify-between border-b border-gov-success/20 pb-1">
                            <span>Poszukiwanie wł.:</span>
                            <span className="font-bold">6 mies.</span>
                        </li>
                         <li className="flex justify-between border-b border-gov-success/20 pb-1">
                            <span>Nabycie (znany wł.):</span>
                            <span className="font-bold">6 mies.</span>
                        </li>
                        <li className="flex justify-between border-b border-gov-success/20 pb-1">
                            <span>Nabycie (nieznany):</span>
                            <span className="font-bold">12 mies.</span>
                        </li>
                        <li className="flex justify-between pt-1">
                            <span>Limit (rzeczy drobne):</span>
                            <span className="font-bold">230 PLN</span>
                        </li>
                     </ul>
                </div>

                <div className="bg-white border border-gov-border p-5">
                    <h4 className="font-bold text-gov-black mb-3 text-sm uppercase tracking-wide">Pomoc techniczna</h4>
                    <p className="text-sm text-gov-text mb-2">
                        W razie problemów z działaniem rejestru skontaktuj się z administratorem systemu dane.gov.pl.
                    </p>
                    <a href="#" className="text-sm font-bold text-gov-blue hover:underline">Centrum Pomocy &rarr;</a>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default function Home() {
  return (
    //<ProtectedRoute>
      //<DashboardContent />
    //</ProtectedRoute>
    <div>Under Maintentance</div>
  );
}
