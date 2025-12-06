import { NextRequest, NextResponse } from "next/server";
import { getInstitutions, getStarostwa } from "@/lib/daneGovApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const type = searchParams.get("type") || "starostwo"; // starostwo, urzad, all
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "50");

    let result;

    if (type === "starostwo") {
      result = await getStarostwa(search, page, perPage);
    } else {
      result = await getInstitutions(search, page, perPage);
    }

    const institutions = result.institutions.map((inst) => ({
      id: inst.id,
      nazwa: inst.attributes.title,
      miasto: inst.attributes.city,
      email: inst.attributes.email,
      telefon: inst.attributes.tel,
      adres: [
        inst.attributes.street_type,
        inst.attributes.street,
        inst.attributes.street_number,
        inst.attributes.postal_code,
        inst.attributes.city,
      ]
        .filter(Boolean)
        .join(" "),
      website: inst.attributes.website,
      regon: inst.attributes.regon,
      epuap: inst.attributes.epuap,
    }));

    return NextResponse.json({
      institutions,
      total: result.total,
      page,
      per_page: perPage,
    });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać listy instytucji" },
      { status: 500 }
    );
  }
}

