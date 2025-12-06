import { NextRequest, NextResponse } from "next/server";
import { getRzeczyZnalezione, isSupabaseConfigured } from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Mapowanie kategorii na kategorie DCAT
const KATEGORIA_TO_DCAT: Record<string, string> = {
  elektronika: "TECH",
  dokumenty: "GOVE",
  bizuteria: "SOCI",
  odziez: "SOCI",
  klucze: "SOCI",
  portfel: "SOCI",
  torba: "SOCI",
  inne: "SOCI",
};

// Generuj XML w formacie harvestera dane.gov.pl (XSD 1.13)
// WAŻNE: Musi być DETERMINISTYCZNY (ten sam output dla tych samych danych)
export function generateDaneGovXML(
  items: RzeczZnaleziona[],
  institutionName: string,
  baseUrl: string
): string {
  // STAŁY extIdent - nie zmienia się!
  const datasetId = "rejestr-rzeczy-znalezionych";
  
  // lastUpdateDate - użyj najnowszej daty modyfikacji z danych
  // lub stałej daty jeśli brak danych
  const lastUpdate = items.length > 0 
    ? items.reduce((latest, item) => {
        const itemDate = new Date(item.data_modyfikacji);
        return itemDate > latest ? itemDate : latest;
      }, new Date(items[0].data_modyfikacji)).toISOString()
    : "2025-12-06T00:00:00.000Z";

  // Generuj zasoby (każdy przedmiot jako osobny zasób)
  const resourcesXml = items
    .map((item) => {
      const resourceUrl = `${baseUrl}/api/items/${item.id}`;
      const terytCode = item.lokalizacja.gmina_teryt;
      
      return `
		<resource status="published">
			<extIdent>${escapeXml(item.id)}</extIdent>
			<url>${escapeXml(resourceUrl)}</url>
			<title>
				<polish>${escapeXml(item.nazwa_przedmiotu)}</polish>
			</title>
			<description>
				<polish>${escapeXml(item.opis)} | Kategoria: ${item.kategoria} | Lokalizacja: ${escapeXml(item.lokalizacja.opis)}${item.lokalizacja.powiat ? ` | Powiat: ${escapeXml(item.lokalizacja.powiat)}` : ""}</polish>
			</description>
			<availability>remote</availability>
			<dataDate>${item.data_znalezienia}</dataDate>
			<lastUpdateDate>${item.data_modyfikacji}</lastUpdateDate>${terytCode ? `
			<regions>
				<terytIdent>${escapeXml(terytCode)}</terytIdent>
			</regions>` : ""}
		</resource>`;
    })
    .join("");

  // Zbierz unikalne kategorie DCAT
  const dynamicCategories = items.map((i) => KATEGORIA_TO_DCAT[i.kategoria] || "SOCI");
  const allCategories = [...new Set(["GOVE", "SOCI", ...dynamicCategories])];
  const categoriesXml = allCategories.map((cat) => `<category>${cat}</category>`).join("\n\t\t");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ns2:datasets xmlns:ns2="urn:otwarte-dane:harvester:1.13" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<dataset status="published">
		<extIdent>${escapeXml(datasetId)}</extIdent>
		<title>
			<polish>Rejestr rzeczy znalezionych - ${escapeXml(institutionName)}</polish>
			<english>Lost and Found Registry - ${escapeXml(institutionName)}</english>
		</title>
		<description>
			<polish>Wykaz rzeczy znalezionych prowadzony przez ${escapeXml(institutionName)}. Dane udostępniane zgodnie z nowelizacją ustawy o rzeczach znalezionych.</polish>
			<english>Registry of found items maintained by ${escapeXml(institutionName)}.</english>
		</description>
		<url>${escapeXml(baseUrl)}</url>
		<updateFrequency>weekly</updateFrequency>
		<hasDynamicData>true</hasDynamicData>
		<hasHighValueData>false</hasHighValueData>
		<hasResearchData>false</hasResearchData>
		<categories>
			${categoriesXml}
		</categories>
		<conditions>
			<source>true</source>
			<modification>false</modification>
			<responsibilities>Dane udostępniane przez Biuro Rzeczy Znalezionych. Informacje mogą ulec zmianie.</responsibilities>
		</conditions>
		<resources>${resourcesXml}
		</resources>
		<tags>
			<tag lang="pl">rzeczy znalezione</tag>
			<tag lang="pl">biuro rzeczy znalezionych</tag>
			<tag lang="pl">zguba</tag>
			<tag lang="pl">przedmioty zagubione</tag>
			<tag lang="en">lost and found</tag>
			<tag lang="en">found items</tag>
		</tags>
		<lastUpdateDate>${lastUpdate}</lastUpdateDate>
	</dataset>
</ns2:datasets>`;
}

// Endpoint XML dla harvestera dane.gov.pl
export async function GET(request: NextRequest) {
  try {
    // Pobierz base URL
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Pobierz dane
    let items: RzeczZnaleziona[];
    
    if (isSupabaseConfigured()) {
      items = await getRzeczyZnalezione();
    } else {
      items = inMemoryStore.getAll();
    }

    // Generuj XML
    const xml = generateDaneGovXML(items, "Biuro Rzeczy Znalezionych", baseUrl);

    // WAŻNE: NextResponse z explicit headers dla Vercel
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error generating XML:", error);
    return new NextResponse(`Error generating XML: ${error}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
