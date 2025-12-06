export enum Kategoria {
  ELEKTRONIKA = "elektronika",
  DOKUMENTY = "dokumenty",
  BIZUTERIA = "bizuteria",
  ODZIEZ = "odziez",
  KLUCZE = "klucze",
  PORTFEL = "portfel",
  TORBA = "torba",
  INNE = "inne",
}

export const KategoriaLabels: Record<Kategoria, string> = {
  [Kategoria.ELEKTRONIKA]: "Elektronika",
  [Kategoria.DOKUMENTY]: "Dokumenty",
  [Kategoria.BIZUTERIA]: "Biżuteria",
  [Kategoria.ODZIEZ]: "Odzież",
  [Kategoria.KLUCZE]: "Klucze",
  [Kategoria.PORTFEL]: "Portfel",
  [Kategoria.TORBA]: "Torba/Plecak",
  [Kategoria.INNE]: "Inne",
};

export const KategoriaIcons: Record<Kategoria, string> = {
  [Kategoria.ELEKTRONIKA]: "📱",
  [Kategoria.DOKUMENTY]: "📄",
  [Kategoria.BIZUTERIA]: "💍",
  [Kategoria.ODZIEZ]: "👕",
  [Kategoria.KLUCZE]: "🔑",
  [Kategoria.PORTFEL]: "👛",
  [Kategoria.TORBA]: "🎒",
  [Kategoria.INNE]: "📦",
};

export enum Status {
  DO_ODBIORU = "do_odbioru",
  POSZUKIWANIE_WLASCICIELA = "poszukiwanie_wlasciciela",
  WYDANE = "wydane",
  PRZEKAZANE_STAROSTWO = "przekazane_starostwo",
  PRZEKAZANE_SKARB_PANSTWA = "przekazane_skarb_panstwa",
  NABYTE_PRZEZ_ZNALAZCE = "nabyte_przez_znalazce",
  ZNISZCZONE = "zniszczone",
}

export const StatusLabels: Record<Status, string> = {
  [Status.DO_ODBIORU]: "Do odbioru",
  [Status.POSZUKIWANIE_WLASCICIELA]: "Poszukiwanie właściciela",
  [Status.WYDANE]: "Wydane właścicielowi",
  [Status.PRZEKAZANE_STAROSTWO]: "Przekazane do starostwa",
  [Status.PRZEKAZANE_SKARB_PANSTWA]: "Przekazane Skarbowi Państwa",
  [Status.NABYTE_PRZEZ_ZNALAZCE]: "Nabyte przez znalazcę",
  [Status.ZNISZCZONE]: "Zniszczone (dokumenty)",
};

export const TERMINY_USTAWOWE = {
  ODBIÓR_BUDYNEK_PUBLICZNY_DNI: 30, // wydłużone z 3 do 30 dni
  POSZUKIWANIE_WLASCICIELA_MIESIACE: 6, // tablica ogłoszeń
  NABYCIE_PRZEZ_ZNALAZCE_ZNANY_MIESIACE: 6,
  NABYCIE_PRZEZ_ZNALAZCE_NIEZNANY_MIESIACE: 12,
  LIMIT_WARTOSCI_DROBNE_PLN: 230, // podniesiony limit
};

export interface Lokalizacja {
  opis: string;
  lat: number;
  lng: number;
  gmina_teryt?: string;
  gmina_nazwa?: string;
  powiat?: string;
  wojewodztwo?: string;
}

export interface Urzad {
  nazwa: string;
  email: string;
  telefon: string;
  adres_odbioru: string;
}

export interface RzeczZnaleziona {
  id: string;
  kategoria: Kategoria;
  nazwa_przedmiotu: string;
  opis: string;
  data_znalezienia: string;
  status: Status;
  lokalizacja: Lokalizacja;
  urzad: Urzad;
  szacowana_wartosc_pln?: number; // do porównania z limitem 230 PLN
  czy_dokument_z_danymi?: boolean; // wymaga specjalnego postępowania
  czy_rzecz_niebezpieczna?: boolean; // broń, amunicja, chemikalia
  data_terminu_odbioru?: string; // 30 dni dla budynków publicznych
  data_terminu_nabycia?: string; // 6 lub 12 miesięcy
  dane_gov_institution_id?: string; // ID instytucji z dane.gov.pl
  data_wpisu: string;
  data_modyfikacji: string;
}

export interface RzeczZnalezionaForm {
  kategoria: Kategoria | null;
  nazwa_przedmiotu: string;
  opis: string;
  data_znalezienia: string;
  lokalizacja: Partial<Lokalizacja>;
  urzad: Partial<Urzad>;
}

export const defaultFormData: RzeczZnalezionaForm = {
  kategoria: null,
  nazwa_przedmiotu: "",
  opis: "",
  data_znalezienia: new Date().toISOString().split("T")[0],
  lokalizacja: {
    opis: "",
    lat: 52.0,
    lng: 19.0,
  },
  urzad: {
    nazwa: "",
    email: "",
    telefon: "",
    adres_odbioru: "",
  },
};

export const PHOTO_STEP = {
  id: 0,
  name: "Zdjęcie przedmiotu",
  description: "Zrób zdjęcie, a system automatycznie wypełni formularz",
} as const;

export const WIZARD_STEPS = [
  { id: 1, name: "Kategoria", description: "Wybierz kategorię przedmiotu" },
  { id: 2, name: "Opis", description: "Opisz znaleziony przedmiot" },
  { id: 3, name: "Lokalizacja", description: "Wskaż miejsce znalezienia" },
  { id: 4, name: "Urząd", description: "Dane kontaktowe urzędu" },
  { id: 5, name: "Podsumowanie", description: "Sprawdź i opublikuj" },
] as const;

