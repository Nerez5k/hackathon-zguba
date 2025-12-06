"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { KategoriaLabels, KategoriaIcons } from "@/lib/types";
import type { RzeczZnalezionaForm } from "@/lib/types";

interface Step5Props {
  data: RzeczZnalezionaForm;
}

export default function Step5Summary({ data }: Step5Props) {
  const [MapPreview, setMapPreview] = useState<React.ComponentType<{
    lat: number;
    lng: number;
  }> | null>(null);

  useEffect(() => {
    import("./MapPreview").then((mod) => {
      setMapPreview(() => mod.default);
    });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gov-accent mb-2">
        Podsumowanie
      </h2>
      <p className="text-gov-text-light mb-6">
        Sprawdź wprowadzone dane przed opublikowaniem
      </p>

      <div className="space-y-6">
        <Card>
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {data.kategoria && KategoriaIcons[data.kategoria]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-gov-primary-light text-gov-primary text-xs font-semibold rounded">
                  {data.kategoria && KategoriaLabels[data.kategoria]}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gov-accent">
                {data.nazwa_przedmiotu}
              </h3>
              <p className="text-gov-text mt-1">{data.opis}</p>
              <p className="text-sm text-gov-text-light mt-2">
                Data znalezienia: {formatDate(data.data_znalezienia)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gov-accent mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gov-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Miejsce znalezienia
          </h3>
          
          <p className="text-gov-text mb-2">{data.lokalizacja.opis}</p>
          
          {(data.lokalizacja.gmina_nazwa || data.lokalizacja.powiat || data.lokalizacja.wojewodztwo) && (
            <p className="text-sm text-gov-text-light mb-4">
              {[
                data.lokalizacja.gmina_nazwa,
                data.lokalizacja.powiat && `pow. ${data.lokalizacja.powiat}`,
                data.lokalizacja.wojewodztwo && `woj. ${data.lokalizacja.wojewodztwo}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {data.lokalizacja.lat && data.lokalizacja.lng && MapPreview && (
            <div className="rounded-lg overflow-hidden border border-gov-border h-48">
              <MapPreview lat={data.lokalizacja.lat} lng={data.lokalizacja.lng} />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gov-accent mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gov-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Dane kontaktowe urzędu
          </h3>
          
          <div className="space-y-2">
            <p className="font-semibold text-gov-text">{data.urzad.nazwa}</p>
            
            <div className="flex items-center gap-2 text-sm text-gov-text">
              <svg className="w-4 h-4 text-gov-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {data.urzad.email}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gov-text">
              <svg className="w-4 h-4 text-gov-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {data.urzad.telefon}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gov-text">
              <svg className="w-4 h-4 text-gov-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {data.urzad.adres_odbioru}
            </div>
          </div>
        </Card>

        <div className="p-4 bg-gov-warning-light border border-gov-warning rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gov-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-gov-warning">Przed opublikowaniem</p>
              <p className="text-sm text-gov-text mt-1">
                Po kliknięciu &quot;Opublikuj&quot; dane zostaną zapisane w systemie i będą dostępne publicznie. 
                Upewnij się, że wszystkie informacje są poprawne.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

