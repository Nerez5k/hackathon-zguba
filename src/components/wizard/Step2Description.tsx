"use client";

import { Input, Textarea, ImageUpload } from "@/components/ui";
import { TERMINY_USTAWOWE } from "@/lib/types";
import type { RzeczZnalezionaForm } from "@/lib/types";

interface Step2Props {
  data: RzeczZnalezionaForm;
  onChange: (data: Partial<RzeczZnalezionaForm>) => void;
  errors?: {
    nazwa_przedmiotu?: string;
    opis?: string;
    data_znalezienia?: string;
  };
}

export default function Step2Description({ data, onChange, errors }: Step2Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gov-accent mb-2">
        Opisz znaleziony przedmiot
      </h2>
      <p className="text-gov-text-light mb-6">
        Podaj szczegółowy opis przedmiotu, który pomoże właścicielowi go zidentyfikować
      </p>

      <div className="space-y-6">
        <Input
          label="Nazwa przedmiotu"
          placeholder="np. Smartfon Samsung Galaxy"
          value={data.nazwa_przedmiotu}
          onChange={(e) => onChange({ nazwa_przedmiotu: e.target.value })}
          error={errors?.nazwa_przedmiotu}
          required
          autoFocus
        />

        <Textarea
          label="Szczegółowy opis"
          placeholder="Opisz przedmiot: kolor, rozmiar, charakterystyczne cechy, stan, itp."
          value={data.opis}
          onChange={(e) => onChange({ opis: e.target.value })}
          error={errors?.opis}
          required
          rows={4}
          helperText="Minimum 10 znaków. Im więcej szczegółów, tym łatwiej właściciel zidentyfikuje przedmiot."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data znalezienia"
            type="date"
            value={data.data_znalezienia}
            onChange={(e) => onChange({ data_znalezienia: e.target.value })}
            error={errors?.data_znalezienia}
            required
            max={new Date().toISOString().split("T")[0]}
          />

          <Input
            label="Szacowana wartość (PLN)"
            type="number"
            placeholder="np. 500"
            value={(data as any).szacowana_wartosc_pln || ""}
            onChange={(e) => onChange({ szacowana_wartosc_pln: e.target.value ? Number(e.target.value) : undefined } as any)}
            helperText={`Limit dla rzeczy drobnych: ${TERMINY_USTAWOWE.LIMIT_WARTOSCI_DROBNE_PLN} PLN`}
          />
        </div>

        <ImageUpload
          label="Zdjęcie przedmiotu (opcjonalne)"
          value={(data as any).zdjecie_base64}
          onChange={(value) => onChange({ zdjecie_base64: value } as any)}
          helperText="Zdjęcie pomoże w identyfikacji przedmiotu"
          maxSizeMB={5}
        />

        <div className="p-4 bg-gray-50 rounded-lg border border-gov-border">
          <p className="text-sm font-semibold text-gov-accent mb-3">
            Oznaczenia specjalne (zgodnie z ustawą)
          </p>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(data as any).czy_dokument_z_danymi || false}
                onChange={(e) => onChange({ czy_dokument_z_danymi: e.target.checked } as any)}
                className="mt-1 w-4 h-4 text-gov-primary border-gov-border rounded focus:ring-gov-primary"
              />
              <div>
                <span className="text-sm font-medium text-gov-text">
                  Dokument zawierający dane osobowe
                </span>
                <p className="text-xs text-gov-text-light">
                  Dowód osobisty, prawo jazdy, paszport, legitymacja itp.
                  Wymaga specjalnego postępowania.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(data as any).czy_rzecz_niebezpieczna || false}
                onChange={(e) => onChange({ czy_rzecz_niebezpieczna: e.target.checked } as any)}
                className="mt-1 w-4 h-4 text-gov-primary border-gov-border rounded focus:ring-gov-primary"
              />
              <div>
                <span className="text-sm font-medium text-gov-text">
                  Rzecz niebezpieczna lub wymagająca pozwolenia
                </span>
                <p className="text-xs text-gov-text-light">
                  Broń, amunicja, materiały wybuchowe, chemikalia.
                  Wymaga zawiadomienia Policji.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(data as any).czy_sprzet_wojskowy || false}
                onChange={(e) => onChange({ czy_sprzet_wojskowy: e.target.checked } as any)}
                className="mt-1 w-4 h-4 text-gov-primary border-gov-border rounded focus:ring-gov-primary"
              />
              <div>
                <span className="text-sm font-medium text-gov-text">
                  Sprzęt wojskowy lub dokument wojskowy
                </span>
                <p className="text-xs text-gov-text-light">
                  Wymaga przekazania odpowiednim służbom.
                </p>
              </div>
            </label>
          </div>
        </div>

        {(data as any).czy_rzecz_niebezpieczna && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-700">Uwaga - rzecz niebezpieczna!</p>
                <p className="text-sm text-red-600 mt-1">
                  Zgodnie z ustawą, należy zawiadomić Policję o miejscu, w którym rzecz się znajduje.
                  Nie należy przenosić rzeczy niebezpiecznych.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
