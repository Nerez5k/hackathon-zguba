"use client";

import { useState, useEffect } from "react";
import { Button, Card, Select } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth";
import { Kategoria, KategoriaLabels, Status, StatusLabels, type RzeczZnaleziona } from "@/lib/types";

type ExportFormat = "json" | "csv" | "xml";

interface DaneGovInfo {
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
    institution: string;
  };
  md5: {
    xml: string;
    csv: string;
  };
}

function EksportContent() {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [items, setItems] = useState<RzeczZnaleziona[]>([]);
  const [daneGovInfo, setDaneGovInfo] = useState<DaneGovInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  const [kategoriaFilter, setKategoriaFilter] = useState("");
  const [powiatFilter, setPowiatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [wojewodztwoFilter, setWojewodztwoFilter] = useState("");

  useEffect(() => {
    fetch("/api/items")
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));

    fetch("/api/export/dane-gov?type=info")
      .then(res => res.json())
      .then(data => setDaneGovInfo(data))
      .catch(() => setDaneGovInfo(null));
  }, []);

  const uniquePowiaty = [...new Set(items.map(i => i.lokalizacja.powiat).filter(Boolean))];
  const uniqueWojewodztwa = [...new Set(items.map(i => i.lokalizacja.wojewodztwo).filter(Boolean))];

  const filteredCount = items.filter(item => {
    if (kategoriaFilter && item.kategoria !== kategoriaFilter) return false;
    if (statusFilter && item.status !== statusFilter) return false;
    if (powiatFilter && !item.lokalizacja.powiat?.toLowerCase().includes(powiatFilter.toLowerCase())) return false;
    if (wojewodztwoFilter && !item.lokalizacja.wojewodztwo?.toLowerCase().includes(wojewodztwoFilter.toLowerCase())) return false;
    return true;
  }).length;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    try {
      const params = new URLSearchParams({ format });
      if (kategoriaFilter) params.append("kategoria", kategoriaFilter);
      if (powiatFilter) params.append("powiat", powiatFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (wojewodztwoFilter) params.append("wojewodztwo", wojewodztwoFilter);

      const response = await fetch(`/api/export?${params.toString()}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rzeczy-znalezione-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Nie udało się wyeksportować danych");
    } finally {
      setIsExporting(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearFilters = () => {
    setKategoriaFilter("");
    setPowiatFilter("");
    setStatusFilter("");
    setWojewodztwoFilter("");
  };

  const hasFilters = kategoriaFilter || powiatFilter || statusFilter || wojewodztwoFilter;

  const formats: { id: ExportFormat; name: string; description: string }[] = [
    { id: "json", name: "JSON", description: "Do integracji z API i aplikacjami" },
    { id: "csv", name: "CSV", description: "Kompatybilny z Excel" },
    { id: "xml", name: "XML", description: "Standardowy format wymiany danych" },
  ];

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gov-black mb-2">Eksport danych</h1>
          <p className="text-gov-text">Pobierz dane o rzeczach znalezionych</p>
        </div>

        <Card className="mb-8 border-2 border-gov-primary bg-gradient-to-br from-gov-blue-light to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gov-primary rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gov-black">🇵🇱 Eksport dla dane.gov.pl</h2>
              <p className="text-sm text-gov-text">XML i MD5 zgodne z harvesterem</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 border border-gov-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-gov-primary">{daneGovInfo?.data?.items_count || items.length}</div>
              <div className="text-sm text-gov-text">rekordów do eksportu</div>
            </div>
          </div>

          {daneGovInfo && (
            <div className="space-y-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-green-800 mb-1">URL dla harvestera:</label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-sm font-mono break-all">
                    {daneGovInfo.harvester?.xml_url || `${window.location.origin}/harvester/rzeczy-znalezione.xml`}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(daneGovInfo.harvester?.xml_url || `${window.location.origin}/harvester/rzeczy-znalezione.xml`, "harvester")}
                    className="shrink-0 border-green-300 text-green-700"
                  >
                    {copied === "harvester" ? "✓" : "Kopiuj"}
                  </Button>
                </div>
              </div>

              {daneGovInfo.md5 && (
                <div className="text-xs text-gov-text-light">
                  <strong>Hash MD5:</strong> <code className="bg-gray-100 px-1 rounded">{daneGovInfo.md5.xml}</code>
                </div>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <Button onClick={() => window.open("/harvester/rzeczy-znalezione.xml", "_blank")} className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Pobierz XML
            </Button>
            <Button variant="outline" onClick={() => window.open("/harvester/rzeczy-znalezione.md5", "_blank")} className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Pobierz MD5
            </Button>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="font-bold text-gov-black mb-4 border-b border-gov-border pb-2">Eksport z filtrami</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Kategoria"
              value={kategoriaFilter}
              onChange={(e) => setKategoriaFilter(e.target.value)}
              options={[
                { value: "", label: "Wszystkie" },
                ...Object.values(Kategoria).map(k => ({ value: k, label: KategoriaLabels[k] }))
              ]}
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Wszystkie" },
                ...Object.values(Status).map(s => ({ value: s, label: StatusLabels[s] }))
              ]}
            />
            <Select
              label="Powiat"
              value={powiatFilter}
              onChange={(e) => setPowiatFilter(e.target.value)}
              options={[
                { value: "", label: "Wszystkie" },
                ...uniquePowiaty.map(p => ({ value: p!, label: p! }))
              ]}
            />
            <Select
              label="Województwo"
              value={wojewodztwoFilter}
              onChange={(e) => setWojewodztwoFilter(e.target.value)}
              options={[
                { value: "", label: "Wszystkie" },
                ...uniqueWojewodztwa.map(w => ({ value: w!, label: w! }))
              ]}
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gov-text"><strong>{filteredCount}</strong> rekordów do eksportu</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-gov-blue hover:underline font-bold">Wyczyść filtry</button>
            )}
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {formats.map((format) => (
            <div key={format.id} className="bg-white border border-gov-border p-6">
              <h3 className="text-lg font-bold text-gov-black mb-1">{format.name}</h3>
              <p className="text-sm text-gov-text-light mb-4">{format.description}</p>
              <Button
                variant="outline"
                onClick={() => handleExport(format.id)}
                isLoading={isExporting === format.id}
                className="w-full"
                disabled={filteredCount === 0}
              >
                {isExporting === format.id ? "Eksportowanie..." : `Pobierz ${format.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>Powrót do formularza</Button>
        </div>
      </div>
    </div>
  );
}

export default function EksportPage() {
  return (
    <ProtectedRoute>
      <EksportContent />
    </ProtectedRoute>
  );
}
