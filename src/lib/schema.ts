import { z } from "zod";
import { Kategoria, Status } from "./types";

// Schema lokalizacji
export const lokalizacjaSchema = z.object({
  opis: z.string().min(3, "Opis miejsca musi mieć minimum 3 znaki"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  gmina_teryt: z.string().optional(),
  gmina_nazwa: z.string().optional(),
  powiat: z.string().optional(),
  wojewodztwo: z.string().optional(),
});

// Schema urzędu
export const urzadSchema = z.object({
  nazwa: z.string().min(3, "Nazwa urzędu musi mieć minimum 3 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  telefon: z.string().min(9, "Numer telefonu musi mieć minimum 9 znaków"),
  adres_odbioru: z.string().min(5, "Adres odbioru musi mieć minimum 5 znaków"),
});

// Schema główna rzeczy znalezionej
export const rzeczZnalezionaSchema = z.object({
  id: z.string().uuid(),
  kategoria: z.nativeEnum(Kategoria),
  nazwa_przedmiotu: z.string().min(2, "Nazwa przedmiotu musi mieć minimum 2 znaki"),
  opis: z.string().min(10, "Opis musi mieć minimum 10 znaków"),
  data_znalezienia: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, "Data znalezienia nie może być w przyszłości"),
  status: z.nativeEnum(Status),
  lokalizacja: lokalizacjaSchema,
  urzad: urzadSchema,
  data_wpisu: z.string(),
  data_modyfikacji: z.string(),
});

// Schema formularza (bez id i dat systemowych)
export const rzeczZnalezionaFormSchema = z.object({
  kategoria: z.nativeEnum(Kategoria, { error: "Wybierz kategorię przedmiotu" }),
  nazwa_przedmiotu: z.string().min(2, "Nazwa przedmiotu musi mieć minimum 2 znaki"),
  opis: z.string().min(10, "Opis musi mieć minimum 10 znaków"),
  data_znalezienia: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, "Data znalezienia nie może być w przyszłości"),
  lokalizacja: lokalizacjaSchema,
  urzad: urzadSchema,
});

// Walidacja poszczególnych kroków
export const stepSchemas = {
  1: z.object({
    kategoria: z.nativeEnum(Kategoria, { error: "Wybierz kategorię przedmiotu" }),
  }),
  2: z.object({
    nazwa_przedmiotu: z.string().min(2, "Nazwa przedmiotu musi mieć minimum 2 znaki"),
    opis: z.string().min(10, "Opis musi mieć minimum 10 znaków"),
    data_znalezienia: z.string().refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, "Data znalezienia nie może być w przyszłości"),
  }),
  3: z.object({
    lokalizacja: z.object({
      opis: z.string().min(3, "Opis miejsca musi mieć minimum 3 znaki"),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      gmina_teryt: z.string().optional(),
      gmina_nazwa: z.string().optional(),
      powiat: z.string().optional(),
      wojewodztwo: z.string().optional(),
    }),
  }),
  4: z.object({
    urzad: z.object({
      nazwa: z.string().min(3, "Nazwa urzędu musi mieć minimum 3 znaki"),
      email: z.string().email("Nieprawidłowy adres email"),
      telefon: z.string().min(9, "Numer telefonu musi mieć minimum 9 znaków"),
      adres_odbioru: z.string().min(5, "Adres odbioru musi mieć minimum 5 znaków"),
    }),
  }),
  5: rzeczZnalezionaFormSchema,
} as const;

export type StepNumber = keyof typeof stepSchemas;
