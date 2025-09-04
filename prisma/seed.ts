import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const valla = await prisma.category.upsert({
    where: { slug: "valla" },
    update: {},
    create: { slug: "valla", label: "Valla publicitaria", iconKey: "valla" },
  });
  const mupi = await prisma.category.upsert({
    where: { slug: "mupi" },
    update: {},
    create: { slug: "mupi", label: "MUPI", iconKey: "mupi" },
  });
  const led = await prisma.category.upsert({
    where: { slug: "led" },
    update: {},
    create: { slug: "led", label: "Pantalla LED", iconKey: "led" },
  });

  await prisma.product.upsert({
    where: { slug: "pantalla-led-premium-scz" },
    update: {},
    create: {
      slug: "pantalla-led-premium-scz",
      title: "Pantalla LED premium",
      city: "Santa Cruz",
      country: "Bolivia",
      dimensions: "8×6 m",
      dailyImpressions: 65000,
      type: "Digital",
      lighting: true,
      tags: "Santa Cruz,LED,Digital,Centro",
      images: "/demo/led-1.jpg,/demo/led-2.jpg,/demo/led-3.jpg",
      lat: -17.7833, lng: -63.1821,
      pricePerMonth: 1450,
      printingCost: 320,
      rating: 4.0, reviewsCount: 2,
      categoryId: led.id,
    },
  });
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
