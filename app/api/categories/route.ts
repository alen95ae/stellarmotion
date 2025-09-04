import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cats = await prisma.category.findMany({
    select: { slug: true, label: true, iconKey: true },
    orderBy: { label: "asc" }
  });
  return NextResponse.json(cats);
}
