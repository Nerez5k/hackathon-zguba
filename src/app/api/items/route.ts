import { NextRequest, NextResponse } from "next/server";
import { rzeczZnalezionaSchema } from "@/lib/schema";
import { 
  createRzeczZnaleziona, 
  getRzeczyZnalezione,
  isSupabaseConfigured
} from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";
import type { RzeczZnaleziona } from "@/lib/types";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const items = await getRzeczyZnalezione();
      console.info("[items][supabase] count:", items.length);
      return NextResponse.json(items);
    } else {
      const items = inMemoryStore.getAll();
      console.info("[items][memory] count:", items.length);
      return NextResponse.json(items);
    }
  } catch (error) {
    console.error("[items] Error fetching items:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać listy rzeczy" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = rzeczZnalezionaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: result.error.issues },
        { status: 400 }
      );
    }

    const item = result.data as RzeczZnaleziona;

    if (isSupabaseConfigured()) {
      const created = await createRzeczZnaleziona(item);
      return NextResponse.json(created, { status: 201 });
    } else {
      const created = inMemoryStore.add(item);
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Nie udało się zapisać rzeczy" },
      { status: 500 }
    );
  }
}
