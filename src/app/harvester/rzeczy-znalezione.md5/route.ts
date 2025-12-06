import { NextRequest, NextResponse } from "next/server";
import { getRzeczyZnalezione, isSupabaseConfigured } from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";
import { createHash } from "crypto";
// Importuj DOKŁADNIE tę samą funkcję co endpoint XML!
import { generateDaneGovXML } from "../rzeczy-znalezione.xml/route";

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Endpoint MD5 dla harvestera dane.gov.pl
// WAŻNE: Musi zwracać MD5 DOKŁADNIE tego samego XML co endpoint .xml
export async function GET(request: NextRequest) {
  try {
    // Pobierz base URL - IDENTYCZNIE jak w endpoint XML
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Pobierz dane - IDENTYCZNIE jak w endpoint XML
    let items: RzeczZnaleziona[];
    
    if (isSupabaseConfigured()) {
      items = await getRzeczyZnalezione();
    } else {
      items = inMemoryStore.getAll();
    }

    // Generuj DOKŁADNIE ten sam XML
    const xml = generateDaneGovXML(items, "Biuro Rzeczy Znalezionych", baseUrl);
    
    // Oblicz MD5
    const hash = createHash("md5").update(xml, "utf8").digest("hex");

    return new NextResponse(hash, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error generating MD5:", error);
    return new NextResponse(`Error generating MD5: ${error}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
