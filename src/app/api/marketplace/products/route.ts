import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COUNTRIES } from "@/lib/geo-data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q") ?? "";
  const categorie = searchParams.get("categorie") ?? "";
  const pays = searchParams.get("pays") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(48, parseInt(searchParams.get("limit") ?? "12", 10));
  const skip = (page - 1) * limit;

  // Résoudre le nom du pays depuis son code
  const countryName = pays
    ? COUNTRIES.find((c) => c.code === pays)?.name ?? ""
    : "";

  const where = buildWhere(q, categorie, countryName);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCfa: true,
        images: true,
        origin: true,
        shop: {
          select: {
            name: true,
            slug: true,
            isVerified: true,
          },
        },
        categories: {
          select: {
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total });
}

function buildWhere(q: string, categorie: string, countryName: string) {
  const conditions: object[] = [{ isActive: true }, { inStock: true }];

  if (q) {
    conditions.push({
      name: { contains: q },
    });
  }

  if (categorie) {
    conditions.push({
      categories: {
        some: {
          category: { slug: categorie },
        },
      },
    });
  }

  if (countryName) {
    conditions.push({
      origin: { contains: countryName },
    });
  }

  return { AND: conditions };
}
