import { NextRequest, NextResponse } from "next/server";
import { getRzeczyZnalezione, isSupabaseConfigured } from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";
import { createHash } from "crypto";
import { generateDaneGovXML } from "@/app/harvester/rzeczy-znalezione.xml/route";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateCSV(items: RzeczZnaleziona[]): string {
  const headers = [
    "id", "kategoria", "nazwa_przedmiotu", "opis", "data_znalezienia", "status",
    "lokalizacja_opis", "lokalizacja_lat", "lokalizacja_lng", "gmina_teryt", "powiat",
    "urzad_nazwa", "urzad_email", "urzad_telefon", "data_wpisu", "data_modyfikacji",
  ];

  const rows = items.map((item) =>
    [
      item.id, item.kategoria,
      `"${item.nazwa_przedmiotu.replace(/"/g, '""')}"`,
      `"${item.opis.replace(/"/g, '""')}"`,
      item.data_znalezienia, item.status,
      `"${item.lokalizacja.opis.replace(/"/g, '""')}"`,
      item.lokalizacja.lat, item.lokalizacja.lng,
      item.lokalizacja.gmina_teryt || "", item.lokalizacja.powiat || "",
      `"${item.urzad.nazwa.replace(/"/g, '""')}"`,
      item.urzad.email, item.urzad.telefon, item.data_wpisu, item.data_modyfikacji,
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "xml";

    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    let items: RzeczZnaleziona[];
    if (isSupabaseConfigured()) {
      items = await getRzeczyZnalezione();
    } else {
      items = inMemoryStore.getAll();
    }

    const xml = generateDaneGovXML(items, "Biuro Rzeczy Znalezionych", baseUrl);
    const xmlMd5 = createHash("md5").update(xml, "utf8").digest("hex");

    switch (type.toLowerCase()) {
      case "md5":
        return new NextResponse(xmlMd5, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

      case "csv":
        const csv = generateCSV(items);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="rzeczy-znalezione.csv"`,
          },
        });

      case "info":
        return NextResponse.json({
          items_count: items.length,
          md5: xmlMd5,
          endpoints: {
            xml: `${baseUrl}/harvester/rzeczy-znalezione.xml`,
            md5: `${baseUrl}/harvester/rzeczy-znalezione.md5`,
          },
        });

      case "xml":
      default:
        return new NextResponse(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
