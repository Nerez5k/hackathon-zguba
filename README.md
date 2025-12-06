# Rejestr Rzeczy Znalezionych (HackNation 2025)

Jedno okno do publikacji rzeczy znalezionych w formacie harvestera dane.gov.pl (XML + MD5).

## Kluczowe endpointy
- XML: `https://hackathon-zguba-kn85.vercel.app/harvester/rzeczy-znalezione.xml`
- MD5: `https://hackathon-zguba-kn85.vercel.app/harvester/rzeczy-znalezione.md5`
- Alternatywy: `GET /api/export/dane-gov?type=xml`, `...type=md5`, `...type=csv`

## Co działa
- XML zgodny z XSD 1.13
- MD5 zgodny z treścią XML
- TERYT w lokalizacji, kategorie DCAT: GOVE, SOCI, TECH

## Uruchomienie lokalne
```bash
pnpm install
pnpm dev
```
Aplikacja: http://localhost:3000

## Dane – skrót schematu
- id (UUID), kategoria, nazwa_przedmiotu, opis, data_znalezienia, status
- lokalizacja: opis, lat, lng, gmina_teryt, powiat, wojewodztwo
- urzad: nazwa, email, telefon, adres_odbioru
- data_wpisu, data_modyfikacji

## Funkcjonalność
- Kreator 5 kroków, AI ze zdjecia (opcjonalnie)
- Publiczna mapa zgub (bez auth)
- Eksport: XML/MD5 dla dane.gov.pl + JSON/CSV z filtrami
