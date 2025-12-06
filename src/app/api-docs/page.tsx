"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import Link from "next/link";

interface ApiInfo {
  version: string;
  format: string;
  endpoints: {
    xml: string;
    md5: string;
    csv: string;
    csv_md5: string;
  };
  harvester?: {
    xml_url: string;
    md5_url: string;
    info: string;
  };
  data: {
    items_count: number;
    last_update: string | null;
    institution: string;
  };
  md5: {
    xml: string;
    csv: string;
  };
}

export default function ApiDocsPage() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    fetch("/api/export/dane-gov?type=info")
      .then((res) => res.json())
      .then((data) => setApiInfo(data))
      .catch(() => setApiInfo(null));
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gov-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-white/80 hover:text-white text-sm">
              ← Powrót
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            📡 API Rejestru Rzeczy Znalezionych
          </h1>
          <p className="text-white/80">
            Dokumentacja integracji z portalem dane.gov.pl
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status */}
        <Card className="mb-8 border-2 border-green-500 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-green-800">API Online</h2>
              <p className="text-sm text-green-700">
                {apiInfo?.data?.items_count || 0} rekordów dostępnych | Format: dane.gov.pl harvester 1.13
              </p>
            </div>
          </div>
        </Card>

        {/* Główne endpointy - HARVESTER */}
        <Card className="mb-8 border-2 border-green-500">
          <h2 className="text-xl font-bold text-gov-black mb-4 pb-2 border-b border-green-200 flex items-center gap-2">
            <span className="text-green-600">🎯</span> Endpointy dla harvestera dane.gov.pl (REKOMENDOWANE)
          </h2>
          <p className="text-sm text-gov-text mb-4">
            Te URL-e obsługują automatyczną zamianę <code>.xml</code> → <code>.md5</code> przez harvester.
          </p>

          <div className="space-y-4">
            {/* XML - Harvester */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold text-green-800">XML (do wklejenia w harvesterze)</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-sm font-mono break-all">
                  {baseUrl}/harvester/rzeczy-znalezione.xml
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/harvester/rzeczy-znalezione.xml`, "harvester-xml")}
                  className="border-green-500 text-green-700"
                >
                  {copied === "harvester-xml" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              <p className="text-xs text-green-700">
                XML zgodny z XSD <code>urn:otwarte-dane:harvester:1.13</code> - wklej ten URL w konfiguracji harvestera
              </p>
            </div>

            {/* MD5 - Harvester */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold text-green-800">MD5 (pobierany automatycznie)</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-sm font-mono break-all">
                  {baseUrl}/harvester/rzeczy-znalezione.md5
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/harvester/rzeczy-znalezione.md5`, "harvester-md5")}
                  className="border-green-500 text-green-700"
                >
                  {copied === "harvester-md5" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              <p className="text-xs text-green-700">
                Harvester automatycznie pobiera ten plik (zamienia .xml → .md5)
              </p>
              {apiInfo?.md5?.xml && (
                <p className="text-xs mt-1 text-green-800">
                  Aktualny hash: <code className="bg-white px-1 rounded border border-green-300">{apiInfo.md5.xml}</code>
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Alternatywne endpointy */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gov-black mb-4 pb-2 border-b border-gov-border">
            🔗 Alternatywne endpointy (z parametrami)
          </h2>

          <div className="space-y-4">
            {/* XML */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">XML</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/api/export/dane-gov?type=xml
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/api/export/dane-gov?type=xml`, "xml")}
                >
                  {copied === "xml" ? "✓" : "Kopiuj"}
                </Button>
              </div>
            </div>

            {/* MD5 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">MD5 Checksum</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/api/export/dane-gov?type=md5
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/api/export/dane-gov?type=md5`, "md5")}
                >
                  {copied === "md5" ? "✓" : "Kopiuj"}
                </Button>
              </div>
            </div>

            {/* CSV */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">CSV</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/api/export/dane-gov?type=csv
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/api/export/dane-gov?type=csv`, "csv")}
                >
                  {copied === "csv" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              <p className="text-xs text-gov-text-light">
                Format CSV do pobrania lub integracji z arkuszami kalkulacyjnymi
              </p>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">Info (JSON)</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/api/export/dane-gov?type=info
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/api/export/dane-gov?type=info`, "info")}
                >
                  {copied === "info" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              <p className="text-xs text-gov-text-light">
                Metadane: liczba rekordów, hashe MD5, wszystkie endpointy
              </p>
            </div>
          </div>
        </Card>

        {/* Przykładowa odpowiedź XML */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gov-black mb-4 pb-2 border-b border-gov-border">
            📄 Przykład odpowiedzi XML
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`<?xml version="1.0" encoding="UTF-8"?>
<ns2:datasets xmlns:ns2="urn:otwarte-dane:harvester:1.13">
  <dataset status="published">
    <extIdent>rzeczy-znalezione-123456789</extIdent>
    <title>
      <polish>Rejestr rzeczy znalezionych - Biuro Rzeczy Znalezionych</polish>
      <english>Lost and Found Registry</english>
    </title>
    <description>
      <polish>Wykaz rzeczy znalezionych...</polish>
    </description>
    <updateFrequency>weekly</updateFrequency>
    <categories>
      <category>GOVE</category>
      <category>SOCI</category>
    </categories>
    <resources>
      <resource status="published">
        <extIdent>uuid-przedmiotu</extIdent>
        <url>https://example.com/api/items/uuid</url>
        <title><polish>Telefon Samsung</polish></title>
        <description><polish>Opis przedmiotu...</polish></description>
        <availability>remote</availability>
        <dataDate>2024-12-06</dataDate>
        <regions>
          <terytIdent>1261011</terytIdent>
        </regions>
      </resource>
    </resources>
    <tags>
      <tag lang="pl">rzeczy znalezione</tag>
      <tag lang="pl">zguba</tag>
    </tags>
  </dataset>
</ns2:datasets>`}
          </pre>
        </Card>

        {/* Instrukcja konfiguracji */}
        <Card className="mb-8 bg-amber-50 border-amber-200">
          <h2 className="text-xl font-bold text-gov-black mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Instrukcja konfiguracji harvestera
          </h2>
          
          <ol className="list-decimal list-inside space-y-3 text-gov-text">
            <li>
              <strong>Zaloguj się do panelu administracyjnego dane.gov.pl</strong>
              <p className="ml-6 text-sm text-gov-text-light">
                Użyj konta z uprawnieniami do zarządzania źródłami danych
              </p>
            </li>
            <li>
              <strong>Przejdź do: Źródła danych → Dodaj nowe</strong>
              <p className="ml-6 text-sm text-gov-text-light">
                Wybierz typ źródła: &quot;XML&quot;
              </p>
            </li>
            <li>
              <strong>Wklej URL pliku XML:</strong>
              <div className="ml-6 mt-2">
                <code className="bg-white px-3 py-2 rounded border border-green-300 text-sm font-mono block break-all text-green-800">
                  {baseUrl}/harvester/rzeczy-znalezione.xml
                </code>
              </div>
            </li>
            <li>
              <strong>System automatycznie pobierze MD5</strong>
              <p className="ml-6 text-sm text-gov-text-light">
                Harvester zamienia <code>.xml</code> na <code>.md5</code> w URL, dlatego używamy parametru <code>?type=</code>
              </p>
            </li>
            <li>
              <strong>Ustaw harmonogram importu</strong>
              <p className="ml-6 text-sm text-gov-text-light">
                Zalecane: codziennie lub co tydzień
              </p>
            </li>
            <li>
              <strong>Zapisz i uruchom pierwszy import</strong>
            </li>
          </ol>
        </Card>

        {/* Schemat danych */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gov-black mb-4 pb-2 border-b border-gov-border">
            📋 Schemat danych rzeczy znalezionej
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Pole</th>
                  <th className="text-left p-3 font-semibold">Typ</th>
                  <th className="text-left p-3 font-semibold">Opis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 font-mono text-xs">id</td>
                  <td className="p-3">UUID</td>
                  <td className="p-3">Unikalny identyfikator</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">kategoria</td>
                  <td className="p-3">enum</td>
                  <td className="p-3">elektronika, dokumenty, bizuteria, odziez, klucze, portfel, torba, inne</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">nazwa_przedmiotu</td>
                  <td className="p-3">string</td>
                  <td className="p-3">Nazwa przedmiotu (max 200 znaków)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">opis</td>
                  <td className="p-3">string</td>
                  <td className="p-3">Szczegółowy opis</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">data_znalezienia</td>
                  <td className="p-3">date</td>
                  <td className="p-3">YYYY-MM-DD</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">status</td>
                  <td className="p-3">enum</td>
                  <td className="p-3">do_odbioru, poszukiwanie_wlasciciela, wydane, ...</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">lokalizacja.gmina_teryt</td>
                  <td className="p-3">string</td>
                  <td className="p-3">Kod TERYT gminy (7 cyfr)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">lokalizacja.lat/lng</td>
                  <td className="p-3">number</td>
                  <td className="p-3">Współrzędne geograficzne</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">urzad.*</td>
                  <td className="p-3">object</td>
                  <td className="p-3">Dane kontaktowe urzędu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Linki */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => window.open("/api/export/dane-gov?type=xml", "_blank")}>
            Otwórz XML
          </Button>
          <Button variant="outline" onClick={() => window.open("https://dane.gov.pl/pl/knowledgebase/useful-materials", "_blank")}>
            Baza wiedzy dane.gov.pl
          </Button>
          <Link href="/eksport">
            <Button variant="outline">
              Panel eksportu
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gov-black text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-white/60">
          <p>Rejestr Rzeczy Znalezionych | HackNation 2025</p>
          <p className="mt-1">Zgodny z portalem dane.gov.pl</p>
        </div>
      </footer>
    </div>
  );
}

