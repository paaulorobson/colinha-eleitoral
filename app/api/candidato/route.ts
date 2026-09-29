import { NextRequest, NextResponse } from "next/server";
import { buscar } from "@/lib/tse";

export async function GET(req: NextRequest) {
  const cargo = req.nextUrl.searchParams.get("cargo") || "";
  const numero = req.nextUrl.searchParams.get("numero") || "";
  try {
    const candidato = await buscar(cargo, numero);
    return NextResponse.json({ candidato });
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 502 });
  }
}
