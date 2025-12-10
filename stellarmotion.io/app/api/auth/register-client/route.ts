import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📡 [WEB] Enviando registro de cliente al ERP...");

    const ERP_BASE_URL = process.env.NEXT_PUBLIC_ERP_API_URL || process.env.ERP_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${ERP_BASE_URL}/api/auth/register-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ [WEB] Error del ERP:", result);
      return NextResponse.json(
        { error: result.error || "Error en ERP", action: result.action, message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("🔥 [WEB] Error en register-client API:", error);
    return NextResponse.json(
      { error: "Error interno en API Web" },
      { status: 500 }
    );
  }
}

