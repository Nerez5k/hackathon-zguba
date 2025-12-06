import { NextRequest, NextResponse } from "next/server";
import { getItems, generateDaneGovXML, generateDaneGovCSV, md5 } from "@/lib/daneGovExport";

// ============================================================================
// EKSPORT XML DLA DANE.GOV.PL - ZGODNY Z HARVESTEREM
// Format: urn:otwarte-dane:harvester:1.13
// ============================================================================

// GET - eksportuj dane w formacie zgodnym z harvesterem dane.gov.pl
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "xml"; // xml, md5, csv, csv_md5, info
    const institution = searchParams.get("institution") || "Biuro Rzeczy Znalezionych";

    // Pobierz base URL
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Pobierz dane
    const items = await getItems();

    // Generuj XML
    const xml = generateDaneGovXML(items, institution, baseUrl);
    const xmlMd5 = md5(xml);

    // Generuj CSV
    const csv = generateDaneGovCSV(items);
    const csvMd5 = md5(csv);

    const dateStr = new Date().toISOString().split("T")[0];

    switch (type.toLowerCase()) {
      case "md5":
        // Zwróć hash MD5 pliku XML
        return new NextResponse(xmlMd5, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `inline; filename="rzeczy-znalezione.md5"`,
            "Cache-Control": "no-cache",
          },
        });

      case "csv":
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="rzeczy-znalezione-${dateStr}.csv"`,
          },
        });

      case "csv_md5":
        return new NextResponse(csvMd5, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `inline; filename="rzeczy-znalezione.csv.md5"`,
            "Cache-Control": "no-cache",
          },
        });

      case "info":
        // Zwróć informacje o endpointach (dla dokumentacji)
        return NextResponse.json({
          version: "1.0",
          format: "dane.gov.pl harvester XML 1.13",
          endpoints: {
            // Główne endpointy z parametrami
            xml: `${baseUrl}/api/export/dane-gov?type=xml`,
            md5: `${baseUrl}/api/export/dane-gov?type=md5`,
            csv: `${baseUrl}/api/export/dane-gov?type=csv`,
            csv_md5: `${baseUrl}/api/export/dane-gov?type=csv_md5`,
          },
          harvester: {
            // URL-e dla harvestera dane.gov.pl (bez parametrów, z rozszerzeniami)
            xml_url: `${baseUrl}/harvester/rzeczy-znalezione.xml`,
            md5_url: `${baseUrl}/harvester/rzeczy-znalezione.md5`,
            info: "Harvester automatycznie zamienia .xml na .md5 - te URL-e to obsługują",
          },
          data: {
            items_count: items.length,
            last_update: items[0]?.data_modyfikacji || null,
            institution: institution,
          },
          md5: {
            xml: xmlMd5,
            csv: csvMd5,
          },
          instructions: {
            pl: "Aby zarejestrować źródło danych w portalu dane.gov.pl, podaj URL do pliku XML. System automatycznie pobierze plik MD5 (zamienia .xml na .md5 w URL).",
            harvester_url: `${baseUrl}/harvester/rzeczy-znalezione.xml`,
            harvester_md5: `${baseUrl}/harvester/rzeczy-znalezione.md5`,
          },
        });

      case "xml":
      default:
        // Zwróć XML zgodny z harvesterem
        return new NextResponse(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Content-Disposition": `inline; filename="rzeczy-znalezione.xml"`,
            "Cache-Control": "no-cache",
          },
        });
    }
  } catch (error) {
    console.error("Error generating dane.gov.pl export:", error);
    return NextResponse.json(
      { error: "Nie udało się wygenerować eksportu dla dane.gov.pl" },
      { status: 500 }
    );
  }
}
