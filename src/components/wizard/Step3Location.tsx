"use client";

import { Input } from "@/components/ui";
import { LocationPicker } from "@/components/map";
import type { RzeczZnalezionaForm, Lokalizacja } from "@/lib/types";

interface Step3Props {
  data: RzeczZnalezionaForm;
  onChange: (data: Partial<RzeczZnalezionaForm>) => void;
  errors?: {
    lokalizacja?: {
      opis?: string;
      lat?: string;
      lng?: string;
    };
  };
}

export default function Step3Location({ data, onChange, errors }: Step3Props) {
  const handleLocationChange = (location: Partial<Lokalizacja>) => {
    onChange({
      lokalizacja: {
        ...data.lokalizacja,
        ...location,
      },
    });
  };

  const locationError =
    errors?.lokalizacja?.lat || errors?.lokalizacja?.lng
      ? "Wybierz lokalizację na mapie"
      : undefined;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gov-accent mb-2">
        Wskaż miejsce znalezienia
      </h2>
      <p className="text-gov-text-light mb-6">
        Kliknij na mapę, aby oznaczyć miejsce, gdzie znaleziono przedmiot
      </p>

      <div className="space-y-6">
        <LocationPicker
          value={data.lokalizacja}
          onChange={handleLocationChange}
          error={locationError}
        />

        <Input
          label="Opis miejsca"
          placeholder="np. Przystanek autobusowy przy ul. Głównej, ławka w parku"
          value={data.lokalizacja.opis || ""}
          onChange={(e) =>
            handleLocationChange({ opis: e.target.value })
          }
          error={errors?.lokalizacja?.opis}
          required
          helperText="Dodaj szczegóły, które pomogą zlokalizować miejsce znalezienia"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Gmina"
            value={data.lokalizacja.gmina_nazwa || ""}
            onChange={(e) =>
              handleLocationChange({ gmina_nazwa: e.target.value })
            }
            placeholder="Nazwa gminy"
            helperText="Uzupełni się automatycznie"
          />
          <Input
            label="Powiat"
            value={data.lokalizacja.powiat || ""}
            onChange={(e) =>
              handleLocationChange({ powiat: e.target.value })
            }
            placeholder="Nazwa powiatu"
          />
          <Input
            label="Województwo"
            value={data.lokalizacja.wojewodztwo || ""}
            onChange={(e) =>
              handleLocationChange({ wojewodztwo: e.target.value })
            }
            placeholder="Nazwa województwa"
          />
        </div>
      </div>
    </div>
  );
}

