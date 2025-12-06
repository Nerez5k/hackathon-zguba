import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";
import { Kategoria, Status } from "@/lib/types";

const DEMO_DATA: RzeczZnaleziona[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    kategoria: Kategoria.ELEKTRONIKA,
    nazwa_przedmiotu: "Smartfon Samsung Galaxy S21",
    opis: "Telefon koloru czarnego, ekran pęknięty w prawym górnym rogu. Etui silikonowe przezroczyste. Znaleziony na przystanku autobusowym.",
    data_znalezienia: "2024-12-05",
    status: Status.DO_ODBIORU,
    lokalizacja: {
      opis: "Przystanek autobusowy przy ul. Głównej 15",
      lat: 51.1078852,
      lng: 17.0385376,
      gmina_teryt: "0264011",
      gmina_nazwa: "Wrocław",
      powiat: "Wrocław",
      wojewodztwo: "dolnośląskie",
    },
    urzad: {
      nazwa: "Urząd Miejski Wrocławia - Biuro Rzeczy Znalezionych",
      email: "rzeczy.znalezione@um.wroc.pl",
      telefon: "+48 71 777 77 77",
      adres_odbioru: "ul. Zapolskiej 4, pok. 12, 50-032 Wrocław",
    },
    data_wpisu: new Date().toISOString(),
    data_modyfikacji: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    kategoria: Kategoria.DOKUMENTY,
    nazwa_przedmiotu: "Dowód osobisty",
    opis: "Dowód osobisty wystawiony na osobę w średnim wieku. Dokument w dobrym stanie, bez uszkodzeń.",
    data_znalezienia: "2024-12-04",
    status: Status.DO_ODBIORU,
    czy_dokument_z_danymi: true,
    lokalizacja: {
      opis: "Park Miejski, ławka przy fontannie",
      lat: 52.2296756,
      lng: 21.0122287,
      gmina_teryt: "1465011",
      gmina_nazwa: "Warszawa",
      powiat: "Warszawa",
      wojewodztwo: "mazowieckie",
    },
    urzad: {
      nazwa: "Urząd Dzielnicy Śródmieście m.st. Warszawy",
      email: "biuro.rzeczy@um.warszawa.pl",
      telefon: "+48 22 443 93 93",
      adres_odbioru: "ul. Nowogrodzka 43, parter, 00-691 Warszawa",
    },
    data_wpisu: new Date(Date.now() - 86400000).toISOString(),
    data_modyfikacji: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    kategoria: Kategoria.KLUCZE,
    nazwa_przedmiotu: "Pęk kluczy z brelokiem",
    opis: "Pęk 5 kluczy na metalowym kółku. Brelok w kształcie serca z napisem 'Kraków'. Dwa klucze mieszkaniowe, jeden do samochodu (VW), dwa mniejsze.",
    data_znalezienia: "2024-12-03",
    status: Status.POSZUKIWANIE_WLASCICIELA,
    szacowana_wartosc_pln: 50,
    lokalizacja: {
      opis: "Rynek Główny, okolice Sukiennic",
      lat: 50.0616868,
      lng: 19.9374809,
      gmina_teryt: "1261011",
      gmina_nazwa: "Kraków",
      powiat: "Kraków",
      wojewodztwo: "małopolskie",
    },
    urzad: {
      nazwa: "Urząd Miasta Krakowa - Wydział Spraw Administracyjnych",
      email: "rzeczy@um.krakow.pl",
      telefon: "+48 12 616 91 91",
      adres_odbioru: "al. Powstania Warszawskiego 10, pok. 214, 31-541 Kraków",
    },
    data_wpisu: new Date(Date.now() - 172800000).toISOString(),
    data_modyfikacji: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    kategoria: Kategoria.PORTFEL,
    nazwa_przedmiotu: "Skórzany portfel męski",
    opis: "Brązowy skórzany portfel, wewnątrz kilka kart płatniczych i banknotów. Bez dokumentów tożsamości.",
    data_znalezienia: "2024-12-06",
    status: Status.DO_ODBIORU,
    szacowana_wartosc_pln: 350,
    lokalizacja: {
      opis: "Dworzec PKP Poznań Główny, peron 3",
      lat: 52.4023,
      lng: 16.9119,
      gmina_teryt: "3064011",
      gmina_nazwa: "Poznań",
      powiat: "Poznań",
      wojewodztwo: "wielkopolskie",
    },
    urzad: {
      nazwa: "Urząd Miasta Poznania - Biuro Rzeczy Znalezionych",
      email: "brz@um.poznan.pl",
      telefon: "+48 61 878 50 00",
      adres_odbioru: "ul. Libelta 16/20, 61-706 Poznań",
    },
    data_wpisu: new Date().toISOString(),
    data_modyfikacji: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    kategoria: Kategoria.TORBA,
    nazwa_przedmiotu: "Plecak turystyczny Deuter",
    opis: "Zielony plecak turystyczny 40L marki Deuter. Wewnątrz butelka wody, kurtka przeciwdeszczowa i mapa Tatr.",
    data_znalezienia: "2024-12-02",
    status: Status.POSZUKIWANIE_WLASCICIELA,
    szacowana_wartosc_pln: 400,
    lokalizacja: {
      opis: "Szlak na Morskie Oko, okolice Włosienicy",
      lat: 49.2016,
      lng: 20.0714,
      gmina_teryt: "1217011",
      gmina_nazwa: "Bukowina Tatrzańska",
      powiat: "tatrzański",
      wojewodztwo: "małopolskie",
    },
    urzad: {
      nazwa: "Starostwo Powiatowe w Zakopanem",
      email: "starostwo@zakopane.pl",
      telefon: "+48 18 202 45 60",
      adres_odbioru: "ul. Chramcówki 15, 34-500 Zakopane",
    },
    data_wpisu: new Date(Date.now() - 345600000).toISOString(),
    data_modyfikacji: new Date(Date.now() - 345600000).toISOString(),
  },
];

export async function POST() {
  try {
    const existing = inMemoryStore.getAll();
    existing.forEach((item) => inMemoryStore.delete(item.id));

    DEMO_DATA.forEach((item) => inMemoryStore.add(item));

    return NextResponse.json({
      success: true,
      message: `Załadowano ${DEMO_DATA.length} przykładowych rekordów`,
      count: DEMO_DATA.length,
    });
  } catch (error) {
    console.error("Error loading demo data:", error);
    return NextResponse.json(
      { error: "Nie udało się załadować danych demo" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "Użyj POST aby załadować przykładowe dane do demo",
    available_records: DEMO_DATA.length,
    demo_locations: DEMO_DATA.map((d) => ({
      nazwa: d.nazwa_przedmiotu,
      miasto: d.lokalizacja.gmina_nazwa,
    })),
  });
}

