import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📡 Enviando registro al ERP...");

    const response = await fetch(`${process.env.ERP_BASE_URL}/api/owners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error del ERP:", result);
      return NextResponse.json(
        { error: result.error || "Error en ERP" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("🔥 Error en register API:", error);
    return NextResponse.json(
      { error: "Error interno en API Web" },
      { status: 500 }
    );
  }
}
