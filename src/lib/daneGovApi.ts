// Integracja z API dane.gov.pl
// Dokumentacja: https://api.dane.gov.pl/doc

const API_BASE = "https://api.dane.gov.pl/1.4";

export interface DaneGovInstitution {
  id: string;
  attributes: {
    title: string;
    city: string;
    street: string;
    street_type: string;
    street_number: string;
    postal_code: string;
    email: string;
    tel: string;
    website: string;
    institution_type: string;
    regon: string;
    epuap: string | null;
  };
}

export interface DaneGovResponse<T> {
  data: T[];
  meta: {
    count: number;
    path: string;
  };
  links: {
    next: string | null;
    self: string;
  };
}

// Pobierz listę instytucji (starostw) z API dane.gov.pl
export async function getInstitutions(
  search?: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ institutions: DaneGovInstitution[]; total: number }> {
  try {
    const params = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
    });

    // Szukaj starostw lub urzędów gmin
    if (search) {
      params.append("q", search);
    }

    const response = await fetch(`${API_BASE}/institutions?${params}`, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "pl",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: DaneGovResponse<DaneGovInstitution> = await response.json();

    // Usuń znaczniki HTML z tytułów (API zwraca <mark> dla wyszukiwania)
    const cleanedInstitutions = data.data.map((inst) => ({
      ...inst,
      attributes: {
        ...inst.attributes,
        title: inst.attributes.title.replace(/<\/?mark>/g, ""),
      },
    }));

    return {
      institutions: cleanedInstitutions,
      total: data.meta.count,
    };
  } catch (error) {
    console.error("Failed to fetch institutions from dane.gov.pl:", error);
    return { institutions: [], total: 0 };
  }
}

// Pobierz listę starostw (filtrowanie po słowie "starostwo")
export async function getStarostwa(
  search?: string,
  page: number = 1,
  perPage: number = 50
): Promise<{ institutions: DaneGovInstitution[]; total: number }> {
  const searchTerm = search ? `starostwo ${search}` : "starostwo";
  return getInstitutions(searchTerm, page, perPage);
}

// Pobierz listę urzędów gmin/miast
export async function getUrzedyGmin(
  search?: string,
  page: number = 1,
  perPage: number = 50
): Promise<{ institutions: DaneGovInstitution[]; total: number }> {
  const searchTerm = search ? `urząd ${search}` : "urząd gminy";
  return getInstitutions(searchTerm, page, perPage);
}

// Konwertuj instytucję z API na format urzędu w naszej aplikacji
export function institutionToUrzad(inst: DaneGovInstitution) {
  const addr = inst.attributes;
  const fullAddress = [
    addr.street_type,
    addr.street,
    addr.street_number,
    addr.postal_code,
    addr.city,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    nazwa: addr.title,
    email: addr.email || "",
    telefon: addr.tel || "",
    adres_odbioru: fullAddress,
    // Dodatkowe dane z API
    miasto: addr.city,
    regon: addr.regon,
    website: addr.website,
    epuap: addr.epuap,
    dane_gov_id: inst.id,
  };
}

// Cache dla instytucji (żeby nie odpytywać API za każdym razem)
let cachedStarostwa: DaneGovInstitution[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 godzina

export async function getCachedStarostwa(): Promise<DaneGovInstitution[]> {
  const now = Date.now();
  
  if (cachedStarostwa && now - cacheTimestamp < CACHE_DURATION) {
    return cachedStarostwa;
  }

  // Pobierz wszystkie starostwa (jest ich ~380)
  const result = await getStarostwa("", 1, 500);
  cachedStarostwa = result.institutions;
  cacheTimestamp = now;

  return cachedStarostwa;
}

