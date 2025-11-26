import { NextResponse } from "next/server";
import { getCurrentMonthTaxes, getCurrentYearTaxes } from "@/lib/data/taxes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");

  try {
    let calculation;

    if (period === "year") {
      calculation = await getCurrentYearTaxes();
    } else {
      calculation = await getCurrentMonthTaxes();
    }

    if (!calculation) {
      return NextResponse.json(
        { error: "No se pudieron calcular los impuestos" },
        { status: 500 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error("Error calculating taxes:", error);
    return NextResponse.json(
      { error: "Error al calcular impuestos" },
      { status: 500 }
    );
  }
}


