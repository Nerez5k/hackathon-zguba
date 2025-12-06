"use client";

import { Kategoria, KategoriaLabels, KategoriaIcons } from "@/lib/types";
import type { RzeczZnalezionaForm } from "@/lib/types";

interface Step1Props {
  data: RzeczZnalezionaForm;
  onChange: (data: Partial<RzeczZnalezionaForm>) => void;
  error?: string;
}

export default function Step1Category({ data, onChange, error }: Step1Props) {
  const categories = Object.values(Kategoria);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gov-accent mb-2">
        Wybierz kategorię przedmiotu
      </h2>
      <p className="text-gov-text-light mb-6">
        Wybierz kategorię, która najlepiej opisuje znaleziony przedmiot
      </p>

      <fieldset>
        <legend className="sr-only">Kategoria przedmiotu</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const isSelected = data.kategoria === category;
            return (
              <label
                key={category}
                className={`
                  relative flex flex-col items-center p-4 rounded-xl cursor-pointer
                  border-2 transition-all duration-200
                  hover:border-gov-primary hover:bg-gov-primary-light
                  focus-within:ring-2 focus-within:ring-gov-primary focus-within:ring-offset-2
                  ${
                    isSelected
                      ? "border-gov-primary bg-gov-primary-light"
                      : "border-gov-border bg-gov-surface"
                  }
                `}
              >
                <input
                  type="radio"
                  name="kategoria"
                  value={category}
                  checked={isSelected}
                  onChange={() => onChange({ kategoria: category })}
                  className="sr-only"
                  aria-describedby={error ? "category-error" : undefined}
                />
                <span className="text-4xl mb-2" aria-hidden="true">
                  {KategoriaIcons[category]}
                </span>
                <span
                  className={`text-sm font-semibold text-center ${
                    isSelected ? "text-gov-primary" : "text-gov-text"
                  }`}
                >
                  {KategoriaLabels[category]}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className="w-5 h-5 text-gov-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p id="category-error" className="mt-4 text-sm text-gov-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

