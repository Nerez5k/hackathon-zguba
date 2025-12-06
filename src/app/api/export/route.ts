import { NextRequest, NextResponse } from "next/server";
import { getRzeczyZnalezione, isSupabaseConfigured } from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";

function sanitizeForExport(item: any): RzeczZnaleziona {
  const {
    zdjecie_base64,
    zdjecie_url,
    notatki_wewnetrzne,
    ...publicData
  } = item;
  
  return publicData as RzeczZnaleziona;
}

function toCSV(items: RzeczZnaleziona[]): string {
  const headers = [
    "id",
    "kategoria",
    "nazwa_przedmiotu",
    "opis",
    "data_znalezienia",
    "status",
    "lokalizacja_opis",
    "lokalizacja_lat",
    "lokalizacja_lng",
    "lokalizacja_gmina_teryt",
    "lokalizacja_gmina_nazwa",
    "lokalizacja_powiat",
    "lokalizacja_wojewodztwo",
    "urzad_nazwa",
    "urzad_email",
    "urzad_telefon",
    "urzad_adres_odbioru",
    "data_wpisu",
    "data_modyfikacji",
  ];

  const rows = items.map((item) => [
    item.id,
    item.kategoria,
    `"${item.nazwa_przedmiotu.replace(/"/g, '""')}"`,
    `"${item.opis.replace(/"/g, '""')}"`,
    item.data_znalezienia,
    item.status,
    `"${item.lokalizacja.opis.replace(/"/g, '""')}"`,
    item.lokalizacja.lat,
    item.lokalizacja.lng,
    item.lokalizacja.gmina_teryt || "",
    item.lokalizacja.gmina_nazwa || "",
    item.lokalizacja.powiat || "",
    item.lokalizacja.wojewodztwo || "",
    `"${item.urzad.nazwa.replace(/"/g, '""')}"`,
    item.urzad.email,
    item.urzad.telefon,
    `"${item.urzad.adres_odbioru.replace(/"/g, '""')}"`,
    item.data_wpisu,
    item.data_modyfikacji,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function toXML(items: RzeczZnaleziona[]): string {
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const itemsXml = items
    .map(
      (item) => `
    <rzecz_znaleziona>
      <id>${item.id}</id>
      <kategoria>${item.kategoria}</kategoria>
      <nazwa_przedmiotu>${escapeXml(item.nazwa_przedmiotu)}</nazwa_przedmiotu>
      <opis>${escapeXml(item.opis)}</opis>
      <data_znalezienia>${item.data_znalezienia}</data_znalezienia>
      <status>${item.status}</status>
      <lokalizacja>
        <opis>${escapeXml(item.lokalizacja.opis)}</opis>
        <lat>${item.lokalizacja.lat}</lat>
        <lng>${item.lokalizacja.lng}</lng>
        <gmina_teryt>${item.lokalizacja.gmina_teryt || ""}</gmina_teryt>
        <gmina_nazwa>${item.lokalizacja.gmina_nazwa || ""}</gmina_nazwa>
        <powiat>${item.lokalizacja.powiat || ""}</powiat>
        <wojewodztwo>${item.lokalizacja.wojewodztwo || ""}</wojewodztwo>
      </lokalizacja>
      <urzad>
        <nazwa>${escapeXml(item.urzad.nazwa)}</nazwa>
        <email>${item.urzad.email}</email>
        <telefon>${item.urzad.telefon}</telefon>
        <adres_odbioru>${escapeXml(item.urzad.adres_odbioru)}</adres_odbioru>
      </urzad>
      <data_wpisu>${item.data_wpisu}</data_wpisu>
      <data_modyfikacji>${item.data_modyfikacji}</data_modyfikacji>
    </rzecz_znaleziona>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rzeczy_znalezione xmlns="https://dane.gov.pl/schemas/rzeczy-znalezione">
  <metadata>
    <data_eksportu>${new Date().toISOString()}</data_eksportu>
    <liczba_rekordow>${items.length}</liczba_rekordow>
    <zrodlo>Rejestr Rzeczy Znalezionych</zrodlo>
  </metadata>
  <dane>${itemsXml}
  </dane>
</rzeczy_znalezione>`;
}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    
    const kategoria = searchParams.get("kategoria");
    const powiat = searchParams.get("powiat");
    const status = searchParams.get("status");
    const wojewodztwo = searchParams.get("wojewodztwo");
    const id = searchParams.get("id");

    let rawItems: RzeczZnaleziona[];

    if (isSupabaseConfigured()) {
      rawItems = await getRzeczyZnalezione();
    } else {
      rawItems = inMemoryStore.getAll();
    }

    let filteredItems = rawItems;
    
    if (id) {
      filteredItems = filteredItems.filter(item => item.id === id);
    }
    if (kategoria) {
      filteredItems = filteredItems.filter(item => item.kategoria === kategoria);
    }
    if (powiat) {
      filteredItems = filteredItems.filter(item => 
        item.lokalizacja.powiat?.toLowerCase().includes(powiat.toLowerCase())
      );
    }
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }
    if (wojewodztwo) {
      filteredItems = filteredItems.filter(item => 
        item.lokalizacja.wojewodztwo?.toLowerCase().includes(wojewodztwo.toLowerCase())
      );
    }

    const items = filteredItems.map(sanitizeForExport);

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = id 
      ? `rzecz-${id.slice(0, 8)}-${dateStr}` 
      : `rzeczy-znalezione-${dateStr}`;

    switch (format.toLowerCase()) {
      case "csv": {
        const csv = toCSV(items);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}.csv"`,
          },
        });
      }

      case "xml": {
        const xml = toXML(items);
        return new NextResponse(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}.xml"`,
          },
        });
      }

      case "json":
      default: {
        const json = {
          metadata: {
            data_eksportu: new Date().toISOString(),
            liczba_rekordow: items.length,
            zrodlo: "Rejestr Rzeczy Znalezionych",
            format_wersja: "1.0",
            filtry: {
              kategoria: kategoria || null,
              powiat: powiat || null,
              status: status || null,
              wojewodztwo: wojewodztwo || null,
            },
          },
          dane: items,
        };
        return new NextResponse(JSON.stringify(json, null, 2), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}.json"`,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Nie udało się wyeksportować danych" },
      { status: 500 }
    );
  }
}
