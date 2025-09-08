import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const category = sp.get("category") ?? undefined;
  const q = sp.get("q") ?? undefined;
  const priceMin = Number(sp.get("priceMin") ?? "0");
  const priceMax = Number(sp.get("priceMax") ?? "10000000");
  const city = sp.get("city") ?? undefined;

  const where: any = {
    pricePerMonth: { gte: priceMin, lte: priceMax },
    ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    ...(q ? {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      slug: true, title: true, city: true, country: true,
      images: true, pricePerMonth: true,
      category: { select: { slug: true, iconKey: true, label: true } }
    }
  });
  return NextResponse.json(items);
}
