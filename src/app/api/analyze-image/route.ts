import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Jesteś asystentem pomagającym urzędnikom katalogować rzeczy znalezione.
Analizujesz zdjęcie znalezionego przedmiotu i zwracasz dane w formacie JSON.

Kategorie do wyboru (TYLKO te wartości):
- "elektronika" - telefony, laptopy, tablety, słuchawki, ładowarki
- "dokumenty" - dowody, paszporty, prawa jazdy, legitymacje, karty
- "bizuteria" - pierścionki, naszyjniki, zegarki, bransoletki
- "odziez" - ubrania, buty, czapki, szaliki, rękawiczki
- "klucze" - klucze, breloki, piloty
- "portfel" - portfele, portmonetki, etui na karty
- "torba" - torby, plecaki, walizki, saszetki
- "inne" - wszystko inne

Zwróć TYLKO poprawny JSON bez żadnego dodatkowego tekstu:
{
  "kategoria": "jedna z powyższych kategorii",
  "nazwa_przedmiotu": "krótka nazwa, np. 'Smartfon Samsung Galaxy S21'",
  "opis": "szczegółowy opis: kolor, rozmiar, stan, charakterystyczne cechy, uszkodzenia",
  "szacowana_wartosc_pln": liczba lub null jeśli trudno oszacować,
  "czy_dokument_z_danymi": true/false - czy zawiera dane osobowe,
  "czy_rzecz_niebezpieczna": true/false - czy może być niebezpieczna
}`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "Brak obrazu do analizy" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Brak klucza API OpenAI. Skonfiguruj OPENAI_API_KEY w .env.local" },
        { status: 500 }
      );
    }

    // Ensure proper base64 format
    const imageData = image.startsWith("data:") 
      ? image 
      : `data:image/jpeg;base64,${image}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Przeanalizuj to zdjęcie znalezionego przedmiotu i zwróć dane w formacie JSON.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Brak odpowiedzi z API" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let parsedData;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json(
        { error: "Nie udało się przetworzyć odpowiedzi AI", raw: content },
        { status: 500 }
      );
    }

    // Validate kategoria
    const validCategories = [
      "elektronika", "dokumenty", "bizuteria", "odziez", 
      "klucze", "portfel", "torba", "inne"
    ];
    
    if (!validCategories.includes(parsedData.kategoria)) {
      parsedData.kategoria = "inne";
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });

  } catch (error) {
    console.error("Error analyzing image:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
    
    return NextResponse.json(
      { error: `Błąd analizy obrazu: ${errorMessage}` },
      { status: 500 }
    );
  }
}

