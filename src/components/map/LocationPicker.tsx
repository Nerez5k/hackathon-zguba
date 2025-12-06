"use client";

import { useEffect, useState, useCallback } from "react";
import type { Lokalizacja } from "@/lib/types";

interface LocationPickerProps {
  value: Partial<Lokalizacja>;
  onChange: (location: Partial<Lokalizacja>) => void;
  error?: string;
}

export default function LocationPicker({
  value,
  onChange,
  error,
}: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    value: Partial<Lokalizacja>;
    onLocationSelect: (lat: number, lng: number) => void;
  }> | null>(null);

  useEffect(() => {
    setIsClient(true);
    import("./MapView").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  const handleLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      
      const newLocation: Partial<Lokalizacja> = {
        ...value,
        lat,
        lng,
      };

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pl`
        );
        const data = await response.json();

        if (data.address) {
          newLocation.gmina_nazwa = data.address.city || data.address.town || data.address.village || data.address.municipality;
          newLocation.powiat = data.address.county;
          newLocation.wojewodztwo = data.address.state;
          
          if (!value.opis) {
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.house_number) parts.push(data.address.house_number);
            if (data.address.city || data.address.town || data.address.village) {
              parts.push(data.address.city || data.address.town || data.address.village);
            }
            if (parts.length > 0) {
              newLocation.opis = parts.join(", ");
            }
          }
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }

      onChange(newLocation);
      setIsLoading(false);
    },
    [value, onChange]
  );

  if (!isClient || !MapComponent) {
    return (
      <div className="w-full h-[400px] bg-gov-surface border-2 border-gov-border rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-primary mx-auto mb-2" />
          <p className="text-gov-text-light">Ładowanie mapy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gov-text mb-1.5">
        Lokalizacja na mapie <span className="text-gov-error">*</span>
      </label>
      <p className="text-sm text-gov-text-light mb-3">
        Kliknij na mapę, aby wskazać miejsce znalezienia przedmiotu
      </p>
      
      <div
        className={`relative rounded-lg overflow-hidden border-2 ${
          error ? "border-gov-error" : "border-gov-border"
        }`}
      >
        <MapComponent value={value} onLocationSelect={handleLocationSelect} />

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="bg-gov-surface px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gov-text">Pobieranie adresu...</span>
            </div>
          </div>
        )}
      </div>

      {value.lat && value.lng && (
        <div className="mt-3 p-3 bg-gov-primary-light rounded-lg">
          <p className="text-sm font-medium text-gov-primary">
            Wybrana lokalizacja:
          </p>
          <p className="text-sm text-gov-text mt-1">
            Szerokość: {value.lat.toFixed(6)}, Długość: {value.lng.toFixed(6)}
          </p>
          {value.gmina_nazwa && (
            <p className="text-sm text-gov-text">
              {value.gmina_nazwa}
              {value.powiat && `, pow. ${value.powiat}`}
              {value.wojewodztwo && `, woj. ${value.wojewodztwo}`}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-gov-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
