"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import Link from "next/link";

export default function ApiDocsPage() {
  const [md5Hash, setMd5Hash] = useState<string>("");
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    fetch("/harvester/rzeczy-znalezione.md5")
      .then((res) => res.text())
      .then((hash) => setMd5Hash(hash.trim()))
      .catch(() => setMd5Hash(""));

    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItemsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setItemsCount(0));
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gov-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-white/80 hover:text-white text-sm">
              ← Powrót
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            📡 API dla harvestera dane.gov.pl
          </h1>
          <p className="text-white/80">
            Eksport danych zgodny z XSD 1.13
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8 border-2 border-green-500 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-green-800">✅ API Online</h2>
              <p className="text-sm text-green-700">
                {itemsCount} rekordów | Format: <code>urn:otwarte-dane:harvester:1.13</code>
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-8 border-2 border-gov-blue">
          <h2 className="text-xl font-bold text-gov-black mb-4 pb-2 border-b border-gov-border">
            🎯 Endpointy dla harvestera
          </h2>

          <div className="space-y-4">
            {/* XML */}
            <div className="bg-gov-blue-light rounded-lg p-4 border border-gov-blue">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gov-blue text-white text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">XML</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/harvester/rzeczy-znalezione.xml
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/harvester/rzeczy-znalezione.xml`, "xml")}
                >
                  {copied === "xml" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              <p className="text-xs text-gov-text">
                Dane w formacie XML zgodnym ze schematem harvestera dane.gov.pl
              </p>
            </div>

            <div className="bg-gov-blue-light rounded-lg p-4 border border-gov-blue">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-gov-blue text-white text-xs font-bold rounded">GET</span>
                <span className="font-mono text-sm font-bold">MD5</span>
              </div>
              <div className="flex gap-2 mb-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {baseUrl}/harvester/rzeczy-znalezione.md5
                </code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/harvester/rzeczy-znalezione.md5`, "md5")}
                >
                  {copied === "md5" ? "✓" : "Kopiuj"}
                </Button>
              </div>
              {md5Hash && (
                <p className="text-xs text-gov-text">
                  Aktualny hash: <code className="bg-white px-1 rounded border">{md5Hash}</code>
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => window.open("/harvester/rzeczy-znalezione.xml", "_blank")}>
            Otwórz XML
          </Button>
          <Link href="/eksport">
            <Button variant="outline">
              Panel eksportu
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Powrót do panelu
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-gov-black text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-white/60">
          <p>Rejestr Rzeczy Znalezionych | HackNation 2025</p>
        </div>
      </footer>
    </div>
  );
}
