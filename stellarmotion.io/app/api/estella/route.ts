export const runtime = "nodejs";

const ESTELLA_SYSTEM_PROMPT = `Eres Estella AI, experta en publicidad exterior (OOH - Out of Home y DOOH - Digital Out of Home).
Ayudas a anunciantes y agencias a diseñar campañas estratégicas en soportes como Mupis, marquesinas, pantallas DOOH, vallas y otros formatos.
Puedes recomendar mezclas de soportes según ciudad, presupuesto y duración.
Responde siempre de forma clara, profesional y orientada a negocio.`;

const RECOMMEND_SUPPORTS_TOOL = {
  type: "function" as const,
  function: {
    name: "recommend_supports",
    description:
      "Recomienda una mezcla de soportes OOH/DOOH según ciudad, presupuesto y opcionalmente duración en semanas.",
    parameters: {
      type: "object" as const,
      properties: {
        city: { type: "string" as const, description: "Ciudad donde se realizará la campaña" },
        budget: { type: "number" as const, description: "Presupuesto total en euros" },
        duration_weeks: {
          type: "number" as const,
          description: "Duración de la campaña en semanas (opcional)",
        },
      },
      required: ["city", "budget"] as const,
    },
  },
};

type RecommendSupportsArgs = {
  city: string;
  budget: number;
  duration_weeks?: number;
};

type SuggestedSupport = {
  type: string;
  estimated_impressions: number;
};

type RecommendationPayload = {
  success: true;
  recommendation: {
    city: string;
    suggested_mix: SuggestedSupport[];
  };
};

function buildRecommendation(args: RecommendSupportsArgs): RecommendationPayload {
  const { city, budget } = args;
  const durationWeeks = args.duration_weeks ?? 4;

  const baseImpressions = Math.round((budget / 1000) * (durationWeeks * 1.2) * 10000);
  const suggested_mix: SuggestedSupport[] = [
    { type: "Mupi", estimated_impressions: Math.round(baseImpressions * 0.4) },
    { type: "DOOH Screen", estimated_impressions: Math.round(baseImpressions * 0.6) },
  ];

  return {
    success: true,
    recommendation: {
      city,
      suggested_mix,
    },
  };
}

function parseToolCallArgs(
  raw: string | undefined
): RecommendSupportsArgs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "city" in parsed &&
      "budget" in parsed &&
      typeof (parsed as { city: unknown }).city === "string" &&
      typeof (parsed as { budget: unknown }).budget === "number"
    ) {
      const obj = parsed as { city: string; budget: number; duration_weeks?: number };
      return {
        city: obj.city,
        budget: obj.budget,
        duration_weeks: typeof obj.duration_weeks === "number" ? obj.duration_weeks : undefined,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OpenAI key missing" }, { status: 500 });
  }

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const body = await req.json();
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return Response.json(
        { error: "Campo 'message' es requerido y debe ser un string no vacío" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ESTELLA_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      tools: [RECOMMEND_SUPPORTS_TOOL],
      tool_choice: "auto",
    });

    const choice = completion.choices[0];
    if (!choice?.message) {
      return Response.json(
        { error: "No se obtuvo respuesta del modelo" },
        { status: 502 }
      );
    }

    const { content, tool_calls } = choice.message;

    if (tool_calls && tool_calls.length > 0) {
      const call = tool_calls[0];
      if ("function" in call && call.function?.name === "recommend_supports") {
        const args = parseToolCallArgs(call.function.arguments);
        if (args) {
          const recommendation = buildRecommendation(args);
          return Response.json(recommendation);
        }
      }
    }

    return Response.json({
      reply: content ?? "",
    });
  } catch (error) {
    console.error("[Estella API]", error);
    return Response.json(
      { error: "Error en Estella" },
      { status: 500 }
    );
  }
}
