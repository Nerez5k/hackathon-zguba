# Rejestr Rzeczy Znalezionych

> Centralny system zgłaszania rzeczy znalezionych do rejestru publicznego dane.gov.pl

## O projekcie

**Rejestr Rzeczy Znalezionych** to narzędzie stworzone podczas hackathonu **HackNation 2025**. Jego celem jest ułatwienie samorządom publikowania informacji o rzeczach znalezionych w ujednoliconym formacie zgodnym z [nowelizacją ustawy o rzeczach znalezionych](https://www.gov.pl/web/sprawiedliwosc/ulatwiamy-odzyskanie-zgubionych-przedmiotow-nowelizacja-ustawy-o-rzeczach-znalezionych).

### Problem

Obecnie informacje o rzeczach znalezionych są rozproszone po stronach BIP poszczególnych gmin i powiatów, często w formacie PDF lub Word. Utrudnia to szybkie odnalezienie zgubionych przedmiotów.

### Rozwiązanie

Prosty, 5-krokowy kreator dla urzędników, który:
- Automatycznie rozpoznaje przedmiot ze zdjęcia (AI)
- Zbiera dane w ustandaryzowanym formacie
- Integruje się z bazą instytucji dane.gov.pl
- Umożliwia wskazanie lokalizacji na mapie
- **Eksportuje dane w formacie harvestera dane.gov.pl (XML + MD5)**
- Jest zgodny z wymogami nowelizacji ustawy

---

## 🚀 Zgodność z dane.gov.pl

### Kluczowe funkcje dla harvestera:

| Funkcja | Status | Opis |
|---------|--------|------|
| XML zgodny z XSD 1.13 | ✅ | Format `urn:otwarte-dane:harvester:1.13` |
| MD5 checksum | ✅ | Automatyczna weryfikacja integralności |
| URL-e dla harvestera | ✅ | `/harvester/rzeczy-znalezione.xml` i `.md5` |
| TERYT | ✅ | Kody regionów w lokalizacji |
| Kategorie DCAT | ✅ | GOVE, SOCI, TECH zgodne ze standardem |
| Autoryzacja | ✅ | Panel urzędnika z logowaniem |

### Endpointy dla harvestera dane.gov.pl:

```
# URL do wklejenia w konfiguracji harvestera:
https://twoja-domena.vercel.app/harvester/rzeczy-znalezione.xml

# MD5 pobierany automatycznie (harvester zamienia .xml → .md5):
https://twoja-domena.vercel.app/harvester/rzeczy-znalezione.md5
```

### Alternatywne endpointy (z parametrami):

```
GET /api/export/dane-gov?type=xml    # XML harvestera
GET /api/export/dane-gov?type=md5    # Hash MD5
GET /api/export/dane-gov?type=csv    # CSV
GET /api/export/dane-gov?type=info   # Metadane (JSON)
```

---

## Funkcjonalności

### Panel urzędnika (strona główna)

✅ **Rozpoznawanie zdjęć (AI)** - automatyczne wypełnianie formularza na podstawie zdjęcia przedmiotu  
✅ **5-krokowy wizard** - intuicyjny formularz krok po kroku  
✅ **Integracja z API dane.gov.pl** - wyszukiwanie urzędów bezpośrednio z bazy  
✅ **Interaktywna mapa** - wybór lokalizacji z automatycznym reverse geocoding  
✅ **Autosave** - postęp zapisywany w localStorage  
✅ **Eksport danych** - JSON, CSV, XML z możliwością filtrowania  
✅ **Eksport dla dane.gov.pl** - XML zgodny z harvesterem + MD5

### Publiczna mapa (`/mapa`)

✅ **Dostęp bez logowania** - każdy może przeglądać zguby  
✅ **Geolokalizacja** - automatyczne pokazywanie zgub w okolicy użytkownika  
✅ **Filtrowanie po promieniu** - 5, 10, 25, 50, 100 km  
✅ **Filtrowanie po kategorii i lokalizacji**  
✅ **Szczegóły przedmiotu** - dane kontaktowe urzędu do odbioru

### API (`/api-docs`)

✅ **Dokumentacja API** - wszystkie endpointy z przykładami  
✅ **Instrukcja konfiguracji harvestera** - krok po kroku

### Ogólne

✅ **WCAG 2.1** - dostępność dla osób z niepełnosprawnościami  
✅ **Responsywność** - działa na komputerach i urządzeniach mobilnych  
✅ **Estetyka gov.pl** - spójny wygląd z portalami rządowymi

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Baza danych:** Supabase (PostgreSQL) lub in-memory store
- **Mapa:** Leaflet + OpenStreetMap
- **AI:** OpenAI GPT-4o-mini (analiza zdjęć)
- **Walidacja:** Zod
- **API:** Integracja z api.dane.gov.pl
- **Język:** TypeScript
- **Hosting:** Vercel (zalecany)

---

## Uruchomienie

### Wymagania

- Node.js 18+
- pnpm

### Instalacja

```bash
pnpm install
pnpm dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### Konfiguracja (opcjonalna)

Utwórz plik `.env.local`:

```bash
# Supabase (opcjonalne - bez tego działa in-memory store)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (dla analizy zdjęć)
OPENAI_API_KEY=sk-...
```

### Załadowanie danych demo

```bash
# POST request do załadowania przykładowych danych
curl -X POST http://localhost:3000/api/demo-data
```

---

## 📋 Jak opublikować dane na dane.gov.pl?

### Krok 1: Wdróż aplikację na Vercel

```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Krok 2: Skopiuj URL harvestera

Po wdrożeniu skopiuj URL:
```
https://twoja-nazwa.vercel.app/harvester/rzeczy-znalezione.xml
```

### Krok 3: Skonfiguruj harvester w dane.gov.pl

1. Zaloguj się do panelu administracyjnego dane.gov.pl
2. Przejdź do: **Źródła danych → Dodaj nowe**
3. Wybierz typ: **XML**
4. Wklej URL pliku XML
5. Ustaw harmonogram importu (np. codziennie)
6. Zapisz

System automatycznie pobierze plik MD5 (zamienia `.xml` na `.md5`).

---

## Struktura projektu

```
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Panel urzędnika (chroniony)
│   │   ├── mapa/                       # Publiczna mapa zgub
│   │   ├── lista/                      # Lista rzeczy znalezionych
│   │   ├── eksport/                    # Eksport danych z filtrami
│   │   ├── api-docs/                   # Dokumentacja API
│   │   ├── harvester/                  # Endpointy dla dane.gov.pl
│   │   │   ├── rzeczy-znalezione.xml/  # XML harvestera
│   │   │   └── rzeczy-znalezione.md5/  # MD5 checksum
│   │   └── api/
│   │       ├── items/                  # CRUD rzeczy
│   │       ├── analyze-image/          # Analiza zdjęć (OpenAI)
│   │       ├── institutions/           # API do pobierania instytucji
│   │       ├── export/                 # Standardowy eksport
│   │       ├── export/dane-gov/        # Eksport dla dane.gov.pl
│   │       └── demo-data/              # Ładowanie danych demo
│   ├── components/
│   │   ├── ui/                         # Komponenty UI (WCAG)
│   │   ├── wizard/                     # Kroki formularza
│   │   ├── map/                        # Komponenty mapy
│   │   ├── auth/                       # Logowanie, ochrona tras
│   │   └── layout/                     # Nagłówek, nawigacja
│   └── lib/
│       ├── types.ts                    # TypeScript types
│       ├── schema.ts                   # Walidacja Zod
│       ├── supabase.ts                 # Klient Supabase
│       ├── store.ts                    # In-memory store
│       ├── auth.tsx                    # Kontekst autoryzacji
│       └── daneGovApi.ts               # Integracja z API dane.gov.pl
├── schema/
│   ├── rzeczy-znalezione.schema.json   # JSON Schema
│   └── przykladowe-dane.json           # Przykładowe dane
└── README.md
```

---

## Wzorcowy schemat danych

```json
{
  "id": "uuid-v4",
  "kategoria": "elektronika|dokumenty|bizuteria|odziez|klucze|portfel|torba|inne",
  "nazwa_przedmiotu": "string",
  "opis": "string",
  "data_znalezienia": "YYYY-MM-DD",
  "status": "do_odbioru|poszukiwanie_wlasciciela|wydane|przekazane_starostwo|nabyte_przez_znalazce",
  "szacowana_wartosc_pln": "number (opcjonalne)",
  "czy_dokument_z_danymi": "boolean (opcjonalne)",
  "czy_rzecz_niebezpieczna": "boolean (opcjonalne)",
  "lokalizacja": {
    "opis": "string",
    "lat": "number",
    "lng": "number",
    "gmina_teryt": "string (7 cyfr)",
    "gmina_nazwa": "string",
    "powiat": "string",
    "wojewodztwo": "string"
  },
  "urzad": {
    "nazwa": "string",
    "email": "string",
    "telefon": "string",
    "adres_odbioru": "string"
  },
  "dane_gov_institution_id": "string (ID z api.dane.gov.pl)",
  "data_wpisu": "ISO 8601",
  "data_modyfikacji": "ISO 8601"
}
```

---

## API Endpoints

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/api/items` | Lista wszystkich rzeczy |
| POST | `/api/items` | Dodaj nową rzecz |
| GET | `/api/items/[id]` | Pobierz pojedynczą rzecz |
| PATCH | `/api/items/[id]` | Aktualizuj rzecz |
| DELETE | `/api/items/[id]` | Usuń rzecz |
| POST | `/api/analyze-image` | Analiza zdjęcia (AI) |
| GET | `/api/institutions?q=starostwo` | Wyszukaj instytucje z dane.gov.pl |
| GET | `/api/export?format=json\|csv\|xml` | Eksport danych (z filtrami) |
| **GET** | **`/api/export/dane-gov?type=xml`** | **XML dla harvestera** |
| **GET** | **`/api/export/dane-gov?type=md5`** | **MD5 checksum** |
| GET | `/harvester/rzeczy-znalezione.xml` | XML (URL dla harvestera) |
| GET | `/harvester/rzeczy-znalezione.md5` | MD5 (automatycznie pobierany) |
| POST | `/api/demo-data` | Załaduj dane demonstracyjne |

---

## Zgodność z nowelizacją ustawy

| Zmiana | Implementacja |
|--------|---------------|
| Starosta właściwy według **miejsca znalezienia** | Wyszukiwarka instytucji z API dane.gov.pl + TERYT |
| Termin odbioru **30 dni** (z budynku publicznego) | Automatyczne obliczanie terminów |
| Limit **230 PLN** dla rzeczy drobnych | Pole szacowanej wartości |
| Specjalne postępowanie z dokumentami | Checkbox "dokument z danymi osobowymi" |
| Poszukiwanie właściciela **6 miesięcy** | Statusy zgodne z ustawą |
| Nabycie przez znalazcę **12 miesięcy** | Wyświetlanie pozostałego czasu |
| Rzeczy niebezpieczne → Policja | Flaga "rzecz niebezpieczna" |

---

## Dostępność (WCAG 2.1)

- Semantyczny HTML (`<form>`, `<fieldset>`, `<legend>`, `<label>`)
- Obsługa klawiatury (focus visible)
- ARIA labels dla czytników ekranowych
- Kontrast min. 4.5:1 (AA)
- Responsywność (mobile-first)
- Skip links

---

## Licencja

MIT

---

Projekt stworzony podczas **HackNation 2025** | [dane.gov.pl](https://dane.gov.pl)

### Zasoby

- [API dane.gov.pl - Dokumentacja](https://api.dane.gov.pl/doc)
- [Baza wiedzy dane.gov.pl](https://dane.gov.pl/pl/knowledgebase/useful-materials)
- [Nowelizacja ustawy o rzeczach znalezionych](https://www.gov.pl/web/sprawiedliwosc/ulatwiamy-odzyskanie-zgubionych-przedmiotow-nowelizacja-ustawy-o-rzeczach-znalezionych)
- [Schemat XSD harvestera 1.13](https://dane.gov.pl/source-code/)
