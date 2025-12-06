"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import {
  Kategoria,
  KategoriaLabels,
  KategoriaIcons,
  StatusLabels,
  TERMINY_USTAWOWE,
  type RzeczZnaleziona,
} from "@/lib/types";

export default function MapaPage() {
  const [items, setItems] = useState<RzeczZnaleziona[]>([]);
  const [filteredItems, setFilteredItems] = useState<RzeczZnaleziona[]>([]);
  const [selectedItem, setSelectedItem] = useState<RzeczZnaleziona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useGeoFilter, setUseGeoFilter] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);
  const [MapComponent, setMapComponent] = useState<ComponentType<{
    items: RzeczZnaleziona[];
    selectedItem: RzeczZnaleziona | null;
    onSelectItem: (item: RzeczZnaleziona) => void;
    userLocation: { lat: number; lng: number } | null;
    radiusKm: number;
    useGeoFilter: boolean;
  }> | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    import("@/components/map/PublicMapView").then((mod) => {
      setMapComponent(() => mod.default);
    });
    fetchItems();
    requestUserLocation(true);
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter, locationFilter, userLocation, useGeoFilter, radiusKm]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.filter((item: RzeczZnaleziona) => 
          item.status === "do_odbioru" || item.status === "poszukiwanie_wlasciciela"
        ));
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestUserLocation = (silent = false) => {
    if (!("geolocation" in navigator)) {
      setLocationError("Twoja przeglądarka nie obsługuje geolokalizacji.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setUseGeoFilter(true);
        setLocationError(null);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Brak zgody na lokalizację – możesz nadal korzystać z mapy."
            : "Nie udało się pobrać lokalizacji użytkownika.";
        if (!silent || err.code === err.PERMISSION_DENIED) {
          setLocationError(message);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nazwa_przedmiotu.toLowerCase().includes(query) ||
          item.opis.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.kategoria === categoryFilter);
    }

    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.lokalizacja.gmina_nazwa?.toLowerCase().includes(loc) ||
          item.lokalizacja.powiat?.toLowerCase().includes(loc) ||
          item.lokalizacja.wojewodztwo?.toLowerCase().includes(loc)
      );
    }

    if (userLocation && useGeoFilter) {
      const withinRadius = filtered
        .map((item) => {
          if (!item.lokalizacja.lat || !item.lokalizacja.lng) return null;
          const distance = calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            item.lokalizacja.lat,
            item.lokalizacja.lng
          );
          return { item, distance };
        })
        .filter(
          (entry): entry is { item: RzeczZnaleziona; distance: number } =>
            entry !== null && entry.distance <= radiusKm
        )
        .sort((a, b) => a.distance - b.distance)
        .map((entry) => entry.item);

      filtered = withinRadius;
    }

    setFilteredItems(filtered);

    if (selectedItem && !filtered.some((item) => item.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateDaysLeft = (item: RzeczZnaleziona) => {
    const found = new Date(item.data_znalezienia);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - found.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = 180 - diffDays;
    return daysLeft > 0 ? daysLeft : 0;
  };

  const categoryOptions = [
    { value: "", label: "Wszystkie kategorie" },
    ...Object.values(Kategoria).map((cat) => ({
      value: cat,
      label: KategoriaLabels[cat],
    })),
  ];

  return (
    <div className="min-h-screen bg-gov-background">
      <div className="bg-gov-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">
            🔍 Mapa Rzeczy Znalezionych
          </h1>
          <p className="text-blue-100">
            Szukasz zgubionego przedmiotu? Sprawdź, czy nie został znaleziony w Twojej okolicy.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <h2 className="font-bold text-gov-accent mb-4">Filtruj wyniki</h2>
              <div className="space-y-4">
                <Input
                  label="Szukaj"
                  placeholder="Nazwa lub opis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  label="Kategoria"
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
                <Input
                  label="Lokalizacja"
                  placeholder="Miasto, powiat..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => requestUserLocation(false)}
                    >
                      📍 Użyj mojej lokalizacji
                    </Button>
                    {userLocation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseGeoFilter((prev) => !prev)}
                      >
                        {useGeoFilter ? "Pokaż wszystkie" : "Filtruj blisko mnie"}
                      </Button>
                    )}
                  </div>
                  {userLocation && (
                    <div className="space-y-1">
                      <Select
                        label="Promień od Twojej lokalizacji"
                        options={[
                          { value: "5", label: "5 km" },
                          { value: "10", label: "10 km" },
                          { value: "25", label: "25 km" },
                          { value: "50", label: "50 km" },
                          { value: "100", label: "100 km" },
                        ]}
                        value={radiusKm.toString()}
                        onChange={(e) => setRadiusKm(Number(e.target.value))}
                        disabled={!useGeoFilter}
                      />
                      <p className="text-xs text-gov-primary">
                        {useGeoFilter
                          ? `Pokazujemy zguby w promieniu ${radiusKm} km od Twojej lokalizacji`
                          : "Lokalizacja zapisana – kliknij „Filtruj blisko mnie”, aby zawęzić wyniki"}
                      </p>
                    </div>
                  )}
                  {locationError && (
                    <p className="text-xs text-red-600">{locationError}</p>
                  )}
                  {!userLocation && !locationError && (
                    <p className="text-xs text-gov-text-light">
                      Zezwól na lokalizację, a pokażemy zguby w Twojej okolicy.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <Card className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-gov-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-gov-text-light">Ładowanie...</p>
                </Card>
              ) : filteredItems.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-gov-text-light">Brak wyników</p>
                </Card>
              ) : (
                filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedItem?.id === item.id ? "ring-2 ring-gov-primary" : ""
                    }`}
                    onClick={() => setSelectedItem(item)}
                    padding="sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{KategoriaIcons[item.kategoria]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gov-accent truncate">
                          {item.nazwa_przedmiotu}
                        </p>
                        <p className="text-xs text-gov-text-light">
                          {item.lokalizacja.gmina_nazwa || item.lokalizacja.opis}
                        </p>
                        <p className="text-xs text-gov-primary mt-1">
                          Pozostało {calculateDaysLeft(item)} dni
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <p className="text-xs text-gov-text-light text-center">
              Wyświetlono {filteredItems.length} z {items.length} przedmiotów
            </p>
          </div>

          <div className="lg:col-span-2">
            <Card padding="none" className="overflow-hidden h-[600px]">
              {MapComponent ? (
                <MapComponent
                  items={filteredItems}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  userLocation={userLocation}
                  radiusKm={radiusKm}
                  useGeoFilter={useGeoFilter}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-gov-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-gov-text-light">Ładowanie mapy...</p>
                  </div>
                </div>
              )}
            </Card>

            {selectedItem && (
              <Card className="mt-4">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{KategoriaIcons[selectedItem.kategoria]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gov-primary-light text-gov-primary text-xs font-semibold rounded">
                        {KategoriaLabels[selectedItem.kategoria]}
                      </span>
                      <span className="px-2 py-0.5 bg-gov-success-light text-gov-success text-xs font-semibold rounded">
                        {StatusLabels[selectedItem.status]}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gov-accent">
                      {selectedItem.nazwa_przedmiotu}
                    </h3>
                    <p className="text-gov-text mt-2">{selectedItem.opis}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-semibold text-gov-accent">📍 Miejsce znalezienia</p>
                        <p className="text-sm text-gov-text">{selectedItem.lokalizacja.opis}</p>
                        <p className="text-xs text-gov-text-light">
                          {selectedItem.lokalizacja.gmina_nazwa}, {selectedItem.lokalizacja.powiat}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gov-accent">📅 Data znalezienia</p>
                        <p className="text-sm text-gov-text">{formatDate(selectedItem.data_znalezienia)}</p>
                        <p className="text-xs text-gov-primary font-medium">
                          Pozostało {calculateDaysLeft(selectedItem)} dni na zgłoszenie
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gov-primary-light rounded-lg">
                      <p className="text-sm font-semibold text-gov-primary">🏛️ Gdzie odebrać?</p>
                      <p className="text-sm text-gov-text font-medium">{selectedItem.urzad.nazwa}</p>
                      <p className="text-sm text-gov-text">{selectedItem.urzad.adres_odbioru}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <a href={`tel:${selectedItem.urzad.telefon}`} className="text-gov-primary hover:underline">
                          📞 {selectedItem.urzad.telefon}
                        </a>
                        <a href={`mailto:${selectedItem.urzad.email}`} className="text-gov-primary hover:underline">
                          ✉️ {selectedItem.urzad.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6">
          <h3 className="font-bold text-gov-accent mb-4">⏱️ Ważne terminy ustawowe</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">30 dni</p>
              <p className="text-sm text-gray-600">
                Termin odbioru rzeczy z budynku użyteczności publicznej
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">6 miesięcy</p>
              <p className="text-sm text-gray-600">
                Poszukiwanie właściciela (tablica ogłoszeń)
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">12 miesięcy</p>
              <p className="text-sm text-gray-600">
                Nabycie przez znalazcę (nieznany właściciel)
              </p>
            </div>
          </div>
          <p className="text-xs text-gov-text-light mt-4">
            Źródło: <a href="https://www.gov.pl/web/sprawiedliwosc/ulatwiamy-odzyskanie-zgubionych-przedmiotow-nowelizacja-ustawy-o-rzeczach-znalezionych" target="_blank" className="underline">
              Nowelizacja ustawy o rzeczach znalezionych (2025)
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}

