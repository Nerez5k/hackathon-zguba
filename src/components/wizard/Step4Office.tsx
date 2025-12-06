"use client";

import { useEffect, useState, useCallback } from "react";
import { Input, Button, Card } from "@/components/ui";
import type { RzeczZnalezionaForm, Urzad } from "@/lib/types";

interface Institution {
  id: string;
  nazwa: string;
  miasto: string;
  email: string;
  telefon: string;
  adres: string;
  website: string;
  regon: string;
}

interface Step4Props {
  data: RzeczZnalezionaForm;
  onChange: (data: Partial<RzeczZnalezionaForm>) => void;
  errors?: {
    urzad?: {
      nazwa?: string;
      email?: string;
      telefon?: string;
      adres_odbioru?: string;
    };
  };
}

const LOCAL_STORAGE_KEY = "kreator-urzad-default";

export default function Step4Office({ data, onChange, errors }: Step4Props) {
  const [hasSavedOffice, setHasSavedOffice] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFromApi, setSelectedFromApi] = useState(false);

  useEffect(() => {
    const savedOffice = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedOffice) {
      setHasSavedOffice(true);
      if (!data.urzad.nazwa && !data.urzad.email) {
        try {
          const parsed = JSON.parse(savedOffice) as Urzad;
          onChange({ urzad: parsed });
        } catch (e) {
          console.error("Failed to parse saved office data:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setInstitutions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/institutions?q=${encodeURIComponent(searchQuery)}&type=all&per_page=20`
        );
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data.institutions);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOfficeChange = (updates: Partial<Urzad>) => {
    onChange({
      urzad: {
        ...data.urzad,
        ...updates,
      },
    });
    setSelectedFromApi(false);
  };

  const selectInstitution = (inst: Institution) => {
    onChange({
      urzad: {
        nazwa: inst.nazwa,
        email: inst.email || "",
        telefon: inst.telefon || "",
        adres_odbioru: inst.adres || "",
      },
    });
    setSearchQuery("");
    setShowDropdown(false);
    setSelectedFromApi(true);
  };

  const saveAsDefault = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.urzad));
    setHasSavedOffice(true);
  };

  const loadSavedOffice = () => {
    const savedOffice = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedOffice) {
      try {
        const parsed = JSON.parse(savedOffice) as Urzad;
        onChange({ urzad: parsed });
      } catch (e) {
        console.error("Failed to parse saved office data:", e);
      }
    }
  };

  const clearSavedOffice = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHasSavedOffice(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gov-accent mb-2">
        Dane kontaktowe urzędu
      </h2>
      <p className="text-gov-text-light mb-6">
        Zgodnie z ustawą, właściwy jest <strong>starosta według miejsca znalezienia rzeczy</strong>.
        Wyszukaj urząd w bazie dane.gov.pl lub wprowadź dane ręcznie.
      </p>

      <Card className="mb-6 bg-gov-primary-light border-gov-primary">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gov-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gov-primary mb-2">
              Wyszukaj urząd w bazie dane.gov.pl
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Wpisz nazwę starostwa lub urzędu gminy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => institutions.length > 0 && setShowDropdown(true)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gov-primary bg-white
                  focus:outline-none focus:ring-2 focus:ring-gov-primary/20"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-gov-primary border-t-transparent rounded-full" />
                </div>
              )}
              
              {showDropdown && institutions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gov-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {institutions.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => selectInstitution(inst)}
                      className="w-full px-4 py-3 text-left hover:bg-gov-primary-light border-b border-gov-border last:border-0 transition-colors"
                    >
                      <p className="font-semibold text-gov-accent text-sm">{inst.nazwa}</p>
                      <p className="text-xs text-gov-text-light mt-0.5">
                        {inst.miasto} • {inst.email || "brak email"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gov-text-light mt-2">
              Dane pobierane z <a href="https://dane.gov.pl" target="_blank" rel="noopener" className="underline">dane.gov.pl</a>
            </p>
          </div>
        </div>
      </Card>

      {selectedFromApi && (
        <div className="mb-4 p-3 bg-gov-success-light border border-gov-success rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-gov-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gov-success font-medium">
            Dane uzupełnione z bazy dane.gov.pl
          </span>
        </div>
      )}

      {hasSavedOffice && !selectedFromApi && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gov-text">
            Masz zapisane domyślne dane urzędu
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSavedOffice}>
              Wczytaj zapisane
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSavedOffice}>
              Usuń zapisane
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Input
          label="Nazwa urzędu"
          placeholder="np. Starostwo Powiatowe w Bolesławcu"
          value={data.urzad.nazwa || ""}
          onChange={(e) => handleOfficeChange({ nazwa: e.target.value })}
          error={errors?.urzad?.nazwa}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Adres email"
            type="email"
            placeholder="rzeczy.znalezione@urzad.pl"
            value={data.urzad.email || ""}
            onChange={(e) => handleOfficeChange({ email: e.target.value })}
            error={errors?.urzad?.email}
            required
          />
          <Input
            label="Numer telefonu"
            type="tel"
            placeholder="+48 75 123 45 67"
            value={data.urzad.telefon || ""}
            onChange={(e) => handleOfficeChange({ telefon: e.target.value })}
            error={errors?.urzad?.telefon}
            required
          />
        </div>

        <Input
          label="Adres odbioru"
          placeholder="ul. Rynek 1, pok. 12, 59-700 Bolesławiec"
          value={data.urzad.adres_odbioru || ""}
          onChange={(e) => handleOfficeChange({ adres_odbioru: e.target.value })}
          error={errors?.urzad?.adres_odbioru}
          required
          helperText="Podaj dokładny adres wraz z numerem pokoju/biura"
        />

        <div className="pt-4 border-t border-gov-border">
          <Button
            variant="outline"
            size="sm"
            onClick={saveAsDefault}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            }
          >
            Zapisz jako domyślne dane urzędu
          </Button>
          <p className="mt-2 text-xs text-gov-text-light">
            Zapisane dane będą automatycznie uzupełniane przy następnych wpisach
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gov-border">
        <p className="text-xs text-gov-text-light">
          <strong>Podstawa prawna:</strong> Ustawa o rzeczach znalezionych (nowelizacja 2025) - 
          postępowanie prowadzi starosta właściwy według miejsca znalezienia rzeczy.
          Termin odbioru z budynku użyteczności publicznej: 30 dni.
        </p>
      </div>
    </div>
  );
}
