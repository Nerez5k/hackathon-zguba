"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui";
import type { RzeczZnalezionaForm, Kategoria } from "@/lib/types";

interface Step0PhotoProps {
  onAnalyzed: (data: Partial<RzeczZnalezionaForm> & { zdjecie_base64?: string }) => void;
  onSkip: () => void;
}

interface AnalysisResult {
  kategoria: string;
  nazwa_przedmiotu: string;
  opis: string;
  szacowana_wartosc_pln?: number;
  czy_dokument_z_danymi?: boolean;
  czy_rzecz_niebezpieczna?: boolean;
}

export default function Step0Photo({ onAnalyzed, onSkip }: Step0PhotoProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Wybierz plik graficzny (JPG, PNG, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Plik jest za duży. Maksymalny rozmiar to 10MB.");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imagePreview }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Błąd analizy");
      }

      const analysisData: AnalysisResult = result.data;

      onAnalyzed({
        kategoria: analysisData.kategoria as Kategoria,
        nazwa_przedmiotu: analysisData.nazwa_przedmiotu || "",
        opis: analysisData.opis || "",
        szacowana_wartosc_pln: analysisData.szacowana_wartosc_pln,
        czy_dokument_z_danymi: analysisData.czy_dokument_z_danymi,
        czy_rzecz_niebezpieczna: analysisData.czy_rzecz_niebezpieczna,
        zdjecie_base64: imagePreview,
      } as Partial<RzeczZnalezionaForm> & { zdjecie_base64?: string });

    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Nie udało się przeanalizować zdjęcia");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gov-black mb-2">
          Zdjęcie przedmiotu
        </h2>
        <p className="text-gov-text text-sm">
          Zrób lub wybierz zdjęcie znalezionego przedmiotu. System automatycznie rozpozna kategorię i wypełni opis.
          Ten krok jest opcjonalny – możesz go pominąć.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        id="photo-input"
      />

      {!imagePreview ? (
        <div className="border-2 border-dashed border-gov-border bg-gov-gray-light p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gov-blue-light border border-gov-blue flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gov-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gov-text mb-4">
              Wybierz zdjęcie przedmiotu z urządzenia
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                className="font-bold"
              >
                Wybierz plik
              </Button>
            </div>
            <p className="text-xs text-gov-text-light mt-4">
              Obsługiwane formaty: JPG, PNG, WEBP. Maks. 10MB.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gov-border bg-white p-4">
          <div className="relative aspect-video bg-gov-gray-light flex items-center justify-center overflow-hidden mb-4">
            <img
              src={imagePreview}
              alt="Podgląd zdjęcia"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearImage}
              className="flex-1"
            >
              Zmień zdjęcie
            </Button>
            <Button
              variant="primary"
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              className="flex-1 font-bold"
            >
              {isAnalyzing ? "Analizowanie..." : "Analizuj zdjęcie"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-gov-error-light border-l-4 border-gov-error">
          <p className="font-bold text-gov-error mb-1">Błąd</p>
          <p className="text-sm text-gov-text">{error}</p>
        </div>
      )}

      <div className="bg-gov-blue-light border border-gov-blue p-4">
        <p className="text-sm text-gov-text">
          <strong>Jak to działa?</strong> Po wybraniu zdjęcia, system wykorzysta sztuczną inteligencję 
          do rozpoznania przedmiotu i automatycznego wypełnienia formularza. 
          Wszystkie dane można później edytować.
        </p>
      </div>

      <div className="border-t border-gov-border pt-6">
        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-gov-blue hover:underline decoration-2 underline-offset-4 font-bold"
        >
          Pomiń ten krok i wypełnij formularz ręcznie →
        </button>
      </div>
    </div>
  );
}

