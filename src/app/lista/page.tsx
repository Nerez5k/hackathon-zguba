"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth";
import {
  Kategoria,
  KategoriaLabels,
  KategoriaIcons,
  StatusLabels,
  type RzeczZnaleziona,
} from "@/lib/types";

function ListaContent() {
  const [items, setItems] = useState<RzeczZnaleziona[]>([]);
  const [filteredItems, setFilteredItems] = useState<RzeczZnaleziona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError("Nie udało się pobrać listy rzeczy");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nazwa_przedmiotu.toLowerCase().includes(query) ||
          item.opis.toLowerCase().includes(query) ||
          item.lokalizacja.opis.toLowerCase().includes(query) ||
          item.lokalizacja.gmina_nazwa?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.kategoria === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const categoryOptions = [
    { value: "", label: "Wszystkie kategorie" },
    ...Object.values(Kategoria).map((cat) => ({
      value: cat,
      label: KategoriaLabels[cat],
    })),
  ];

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-primary mx-auto mb-4" />
          <p className="text-gov-text-light">Ładowanie listy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gov-accent">
              Lista rzeczy znalezionych
            </h1>
            <p className="text-gov-text-light mt-1">
              {filteredItems.length} {filteredItems.length === 1 ? "przedmiot" : "przedmiotów"}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/")}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Dodaj nową rzecz
          </Button>
        </div>

        <Card className="mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Szukaj"
                placeholder="Wpisz nazwę, opis lub lokalizację..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              label="Kategoria"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
        </Card>

        {error && (
          <Card className="mb-6 bg-gov-error-light border-gov-error">
            <p className="text-gov-error">{error}</p>
          </Card>
        )}

        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gov-accent mb-2">
              {items.length === 0
                ? "Brak rzeczy w bazie"
                : "Brak wyników wyszukiwania"}
            </h2>
            <p className="text-gov-text-light mb-6">
              {items.length === 0
                ? "Dodaj pierwszą rzecz znalezioną, aby rozpocząć"
                : "Spróbuj zmienić kryteria wyszukiwania"}
            </p>
            {items.length === 0 && (
              <Button variant="primary" onClick={() => (window.location.href = "/")}>
                Dodaj pierwszą rzecz
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">
                    {KategoriaIcons[item.kategoria]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gov-primary-light text-gov-primary text-xs font-semibold rounded">
                        {KategoriaLabels[item.kategoria]}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          item.status === "do_odbioru"
                            ? "bg-gov-success-light text-gov-success"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {StatusLabels[item.status]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gov-accent truncate">
                      {item.nazwa_przedmiotu}
                    </h3>
                    <p className="text-gov-text-light text-sm line-clamp-2 mt-1">
                      {item.opis}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gov-text-light">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.lokalizacja.gmina_nazwa || item.lokalizacja.opis}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(item.data_znalezienia)}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gov-border">
                      <p className="text-sm">
                        <span className="font-semibold">{item.urzad.nazwa}</span>
                        <span className="text-gov-text-light"> · {item.urzad.telefon}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListaPage() {
  return (
    <ProtectedRoute>
      <ListaContent />
    </ProtectedRoute>
  );
}
