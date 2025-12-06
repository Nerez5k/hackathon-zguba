# 🎤 PREZENTACJA FINAŁOWA - Rejestr Rzeczy Znalezionych

## ⏱️ PLAN 5-MINUTOWEJ PREZENTACJI

### Minuta 1: Problem (30s) + Rozwiązanie (30s)

**CO POWIEDZIEĆ:**
> "Dzisiaj dane o rzeczach znalezionych są rozproszone po setkach stron BIP gmin i powiatów, 
> często w formacie PDF czy Word. Jeśli zgubiłeś portfel - musisz przeszukiwać setki stron.
>
> Nasza aplikacja to JEDNO OKNO dla urzędników do publikacji danych w ujednoliconym formacie,
> automatycznie integrowane z portalem dane.gov.pl."

---

### Minuta 2: Demo - Kreator 5 kroków

**POKAŻ NA ŻYWO:**
1. Zaloguj się (demo user)
2. Kliknij "Rozpocznij nową procedurę"
3. Pokaż opcjonalne zdjęcie z AI
4. Przejdź przez 5 kroków:
   - **Krok 1:** Wybór kategorii (kliknij "Elektronika")
   - **Krok 2:** Opis (pokaż autofill z AI jeśli było zdjęcie)
   - **Krok 3:** Mapa z lokalizacją (kliknij na mapę)
   - **Krok 4:** Wybór urzędu (wyszukaj z API dane.gov.pl)
   - **Krok 5:** Podsumowanie i publikacja

**CO POWIEDZIEĆ:**
> "Urzędnik w 5 prostych krokach dodaje rzecz do rejestru. Może zrobić zdjęcie - 
> AI automatycznie rozpozna przedmiot i wypełni formularz."

---

### Minuta 3: Integracja z dane.gov.pl

**POKAŻ:**
- Otwórz `/harvester/rzeczy-znalezione.xml`
- Otwórz `/harvester/rzeczy-znalezione.md5`

**CO POWIEDZIEĆ:**
> "Dane są automatycznie eksportowane w formacie XML zgodnym z harvesterem dane.gov.pl.
> Administrator portalu wkleja nasz URL - i gotowe. System automatycznie synchronizuje dane."

---

### Minuta 4: Mapa publiczna + Zgodność z ustawą

**POKAŻ:**
- Otwórz `/mapa` (bez logowania!)
- Pokaż filtrowanie po kategorii/lokalizacji

**CO POWIEDZIEĆ:**
> "Obywatele mogą przeglądać zguby na interaktywnej mapie - bez logowania.
> Wszystko zgodne z nowelizacją ustawy o rzeczach znalezionych - 
> terminy 30 dni, 6 miesięcy, limit 230 PLN."

---

### Minuta 5: Podsumowanie + Korzyści

**CO POWIEDZIEĆ:**
> "Podsumowując:
> - Urzędnik: 5 kroków zamiast skomplikowanych formularzy
> - Obywatel: jedna mapa zamiast setek stron BIP
> - Portal dane.gov.pl: automatyczna integracja przez harvester
> - Wszystko responsywne, dostępne (WCAG), zgodne z prawem.
>
> Dziękuję!"

---

## 📚 SŁOWNICZEK - CO TO JEST?

### 🔄 HARVESTER
**Co to?** Automat na portalu dane.gov.pl który pobiera dane z zewnętrznych źródeł.

**Jak działa?**
1. Administrator wkleja URL do pliku XML (np. `/harvester/rzeczy-znalezione.xml`)
2. Harvester co X dni pobiera ten plik
3. Parsuje XML i importuje dane do portalu
4. Przed importem sprawdza MD5 - jeśli się nie zmienił, nie importuje ponownie

**Analogia:** Harvester to jak "crawler Google" - regularnie odwiedza strony i aktualizuje bazę.

---

### 🔐 MD5
**Co to?** "Odcisk palca" pliku - 32-znakowy ciąg znaków.

**Po co?**
- Weryfikacja integralności - czy plik się zmienił?
- Harvester porównuje MD5 przed i po pobraniu
- Jeśli hash jest taki sam = dane się nie zmieniły = nie trzeba importować

**Przykład:**
```
Plik XML (1000 znaków) → MD5 → "a1b2c3d4e5f6789012345678901234ab"
```

**Ważne:** Każda najmniejsza zmiana (nawet spacja) zmienia MD5 całkowicie!

---

### 📄 XML
**Co to?** Format danych - jak JSON, ale używany w rządowych systemach.

**Dlaczego XML a nie JSON?**
- dane.gov.pl używa schematu XSD 1.13 (XML Schema Definition)
- Harvester waliduje XML przeciwko temu schematowi
- Jeśli XML nie pasuje do schematu = błąd importu

**Nasza struktura XML:**
```
datasets (główny element)
└── dataset (zbiór danych - "Rejestr rzeczy znalezionych")
    ├── extIdent (stały ID)
    ├── title (tytuł PL + EN)
    ├── description (opis)
    ├── categories (GOVE, SOCI, TECH)
    ├── resources (lista przedmiotów)
    │   └── resource (pojedynczy przedmiot)
    │       ├── extIdent (UUID)
    │       ├── url (link do szczegółów)
    │       ├── title (nazwa przedmiotu)
    │       └── description (opis)
    └── tags (słowa kluczowe)
```

---

### 🗺️ TERYT
**Co to?** Krajowy Rejestr Urzędowy Podziału Terytorialnego Kraju.

**Po co?** 7-cyfrowy kod identyfikujący gminę/powiat/województwo.

**Przykład:** `1261011` = Kraków

**W aplikacji:** Automatycznie pobierany z reverse geocoding po wybraniu lokalizacji na mapie.

---

## ❓ MOŻLIWE PYTANIA JURY + ODPOWIEDZI

### 1. "Dlaczego XML a nie JSON?"
> "Portal dane.gov.pl używa harvestera który wymaga XML w formacie XSD 1.13. 
> To standard używany w całej Unii Europejskiej (DCAT-AP). 
> Dodatkowo oferujemy też JSON i CSV do innych zastosowań."

### 2. "Co jeśli harvester nie może pobrać danych?"
> "Harvester wysyła email do administratora z raportem błędu. 
> Sprawdza też MD5 przed importem - jeśli się nie zgadza, 
> odrzuca import żeby nie wprowadzić uszkodzonych danych."

### 3. "Jak zapewniacie zgodność MD5?"
> "Oba endpointy (XML i MD5) używają DOKŁADNIE tej samej funkcji `generateDaneGovXML`. 
> MD5 jest obliczany z tego samego stringa XML. Dzięki temu hash jest zawsze spójny."

### 4. "Dlaczego extIdent jest stały?"
> "Gdyby extIdent się zmieniał (np. timestamp), harvester traktowałby każdy import 
> jako NOWY zbiór danych i tworzył duplikaty. Stały ID = aktualizacja istniejącego zbioru."

### 5. "Czy to działa z prawdziwym dane.gov.pl?"
> "Tak, XML jest w 100% zgodny ze schematem XSD 1.13. 
> Administrator dane.gov.pl może wkleić nasz URL i uruchomić import. 
> Nie mamy dostępu do panelu admina, ale format jest walidowalny."

### 6. "Jak działa rozpoznawanie zdjęć?"
> "Używamy OpenAI GPT-4o-mini. Zdjęcie jest konwertowane na base64, 
> wysyłane do API, które zwraca kategorię, nazwę i opis przedmiotu. 
> Urzędnik może zaakceptować lub poprawić sugestie."

### 7. "Skąd bierzecie dane urzędów?"
> "Z API dane.gov.pl - endpoint `/institutions`. Wyszukujemy po nazwie 
> i automatycznie uzupełniamy dane kontaktowe."

### 8. "Co z RODO?"
> "Nie przechowujemy danych osobowych. Opisy przedmiotów nie powinny 
> zawierać danych identyfikujących właściciela. Dokumenty z danymi osobowymi 
> mają specjalną flagę i są traktowane inaczej (zgodnie z ustawą)."

### 9. "Czy to jest responsywne?"
> "Tak, Tailwind CSS z breakpointami sm/md/lg. Kreator działa na telefonie. 
> Testowaliśmy na iPhone, Android, tablet."

### 10. "Co z dostępnością WCAG?"
> "Mamy semantyczny HTML, aria-labels, focus visible, kontrast 4.5:1, 
> obsługę klawiatury. Spełniamy WCAG 2.1 poziom AA."

---

## 🔧 JAK DZIAŁA KOD - FLOW DANYCH

### 1. Urzędnik dodaje rzecz (Kreator)
```
Wizard.tsx → POST /api/items → Supabase/In-memory store
```

### 2. Harvester pobiera dane
```
GET /harvester/rzeczy-znalezione.xml
    ↓
getRzeczyZnalezione() → pobiera z bazy
    ↓
generateDaneGovXML() → buduje XML
    ↓
Response z Content-Type: application/xml
```

### 3. Harvester sprawdza MD5
```
GET /harvester/rzeczy-znalezione.md5
    ↓
generateDaneGovXML() → TEN SAM XML co wyżej!
    ↓
createHash("md5").update(xml) → hash
    ↓
Response z Content-Type: text/plain
```

### 4. Import do dane.gov.pl
```
Harvester porównuje MD5:
  - Różny? → Pobiera XML → Parsuje → Importuje do bazy dane.gov.pl
  - Taki sam? → Skip (dane się nie zmieniły)
```

---

## 📂 STRUKTURA PROJEKTU (UPROSZCZONA)

```
src/
├── app/
│   ├── page.tsx              ← Panel urzędnika (po logowaniu)
│   ├── mapa/page.tsx         ← Publiczna mapa (bez logowania)
│   ├── eksport/page.tsx      ← Panel eksportu
│   ├── harvester/
│   │   ├── rzeczy-znalezione.xml/route.ts  ← XML dla dane.gov.pl
│   │   └── rzeczy-znalezione.md5/route.ts  ← MD5 checksum
│   └── api/
│       ├── items/            ← CRUD rzeczy znalezionych
│       ├── analyze-image/    ← AI rozpoznawanie zdjęć
│       └── export/           ← Eksport JSON/CSV/XML
├── components/
│   ├── wizard/               ← 5 kroków formularza
│   ├── map/                  ← Leaflet mapa
│   └── auth/                 ← Logowanie
└── lib/
    ├── types.ts              ← TypeScript typy
    ├── supabase.ts           ← Połączenie z bazą
    └── store.ts              ← In-memory store (fallback)
```

---

## ✅ CHECKLIST PRZED PREZENTACJĄ

- [ ] Vercel deployment działa
- [ ] `/harvester/rzeczy-znalezione.xml` zwraca XML
- [ ] `/harvester/rzeczy-znalezione.md5` zwraca hash
- [ ] Content-Type jest `application/xml`
- [ ] MD5 się zgadza (curl sprawdzony)
- [ ] Demo user działa (logowanie)
- [ ] Jest kilka przykładowych rzeczy w bazie
- [ ] Mapa publiczna działa bez logowania

---

## 🏆 KLUCZOWE ARGUMENTY

1. **Prostota**: 5 kroków zamiast skomplikowanych formularzy BIP
2. **Automatyzacja**: AI rozpoznaje zdjęcia, reverse geocoding dla lokalizacji
3. **Integracja**: Gotowe do podłączenia do dane.gov.pl
4. **Zgodność**: Ustawa, WCAG, responsywność
5. **Realny problem**: 380 powiatów × różne formaty = chaos

---

**Powodzenia na finale! 🚀**

