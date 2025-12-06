import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { RzeczZnaleziona, Urzad } from "./types";

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
}


export function toDbFormat(item: RzeczZnaleziona) {
  return {
    id: item.id,
    kategoria: item.kategoria,
    nazwa_przedmiotu: item.nazwa_przedmiotu,
    opis: item.opis,
    data_znalezienia: item.data_znalezienia,
    status: item.status,
    lokalizacja_opis: item.lokalizacja.opis,
    lokalizacja_lat: item.lokalizacja.lat,
    lokalizacja_lng: item.lokalizacja.lng,
    lokalizacja_gmina_teryt: item.lokalizacja.gmina_teryt || null,
    lokalizacja_gmina_nazwa: item.lokalizacja.gmina_nazwa || null,
    lokalizacja_powiat: item.lokalizacja.powiat || null,
    lokalizacja_wojewodztwo: item.lokalizacja.wojewodztwo || null,
    urzad_nazwa: item.urzad.nazwa,
    urzad_email: item.urzad.email,
    urzad_telefon: item.urzad.telefon,
    urzad_adres_odbioru: item.urzad.adres_odbioru,
  };
}

export function fromDbFormat(row: any): RzeczZnaleziona {
  return {
    id: row.id,
    kategoria: row.kategoria,
    nazwa_przedmiotu: row.nazwa_przedmiotu,
    opis: row.opis,
    data_znalezienia: row.data_znalezienia,
    status: row.status,
    lokalizacja: {
      opis: row.lokalizacja_opis,
      lat: row.lokalizacja_lat,
      lng: row.lokalizacja_lng,
      gmina_teryt: row.lokalizacja_gmina_teryt || undefined,
      gmina_nazwa: row.lokalizacja_gmina_nazwa || undefined,
      powiat: row.lokalizacja_powiat || undefined,
      wojewodztwo: row.lokalizacja_wojewodztwo || undefined,
    },
    urzad: {
      nazwa: row.urzad_nazwa,
      email: row.urzad_email,
      telefon: row.urzad_telefon,
      adres_odbioru: row.urzad_adres_odbioru,
    },
    data_wpisu: row.data_wpisu,
    data_modyfikacji: row.data_modyfikacji,
  };
}


export async function createRzeczZnaleziona(item: RzeczZnaleziona) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from("rzeczy_znalezione")
    .insert(toDbFormat(item))
    .select()
    .single();

  if (error) throw error;
  return data ? fromDbFormat(data) : null;
}

export async function getRzeczyZnalezione() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from("rzeczy_znalezione")
    .select("*")
    .order("data_wpisu", { ascending: false });

  if (error) throw error;
  return data?.map(fromDbFormat) || [];
}

export async function getRzeczZnalezionaById(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from("rzeczy_znalezione")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? fromDbFormat(data) : null;
}

export async function updateRzeczZnaleziona(id: string, updates: Partial<RzeczZnaleziona>) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const dbUpdates: Record<string, unknown> = {};
  
  if (updates.kategoria) dbUpdates.kategoria = updates.kategoria;
  if (updates.nazwa_przedmiotu) dbUpdates.nazwa_przedmiotu = updates.nazwa_przedmiotu;
  if (updates.opis) dbUpdates.opis = updates.opis;
  if (updates.data_znalezienia) dbUpdates.data_znalezienia = updates.data_znalezienia;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.lokalizacja) {
    dbUpdates.lokalizacja_opis = updates.lokalizacja.opis;
    dbUpdates.lokalizacja_lat = updates.lokalizacja.lat;
    dbUpdates.lokalizacja_lng = updates.lokalizacja.lng;
    dbUpdates.lokalizacja_gmina_teryt = updates.lokalizacja.gmina_teryt || null;
    dbUpdates.lokalizacja_gmina_nazwa = updates.lokalizacja.gmina_nazwa || null;
    dbUpdates.lokalizacja_powiat = updates.lokalizacja.powiat || null;
    dbUpdates.lokalizacja_wojewodztwo = updates.lokalizacja.wojewodztwo || null;
  }
  if (updates.urzad) {
    dbUpdates.urzad_nazwa = updates.urzad.nazwa;
    dbUpdates.urzad_email = updates.urzad.email;
    dbUpdates.urzad_telefon = updates.urzad.telefon;
    dbUpdates.urzad_adres_odbioru = updates.urzad.adres_odbioru;
  }

  const { data, error } = await supabase
    .from("rzeczy_znalezione")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data ? fromDbFormat(data) : null;
}

export async function deleteRzeczZnaleziona(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { error } = await supabase
    .from("rzeczy_znalezione")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function saveUrzad(urzad: Urzad) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from("urzedy")
    .upsert({
      nazwa: urzad.nazwa,
      email: urzad.email,
      telefon: urzad.telefon,
      adres_odbioru: urzad.adres_odbioru,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUrzedy() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from("urzedy")
    .select("*")
    .order("nazwa");

  if (error) throw error;
  return data || [];
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
  );
}
