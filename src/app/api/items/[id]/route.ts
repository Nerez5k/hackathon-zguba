import { NextRequest, NextResponse } from "next/server";
import { 
  getRzeczZnalezionaById, 
  updateRzeczZnaleziona, 
  deleteRzeczZnaleziona,
  isSupabaseConfigured
} from "@/lib/supabase";
import { inMemoryStore } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      const item = await getRzeczZnalezionaById(id);
      if (!item) {
        return NextResponse.json(
          { error: "Nie znaleziono rzeczy" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    } else {
      const item = inMemoryStore.getById(id);
      if (!item) {
        return NextResponse.json(
          { error: "Nie znaleziono rzeczy" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać rzeczy" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (isSupabaseConfigured()) {
      const updated = await updateRzeczZnaleziona(id, body);
      if (!updated) {
        return NextResponse.json(
          { error: "Nie znaleziono rzeczy" },
          { status: 404 }
        );
      }
      return NextResponse.json(updated);
    } else {
      const updated = inMemoryStore.update(id, body);
      if (!updated) {
        return NextResponse.json(
          { error: "Nie znaleziono rzeczy" },
          { status: 404 }
        );
      }
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować rzeczy" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured()) {
      await deleteRzeczZnaleziona(id);
      return NextResponse.json({ success: true });
    } else {
      const deleted = inMemoryStore.delete(id);
      if (!deleted) {
        return NextResponse.json(
          { error: "Nie znaleziono rzeczy" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć rzeczy" },
      { status: 500 }
    );
  }
}
