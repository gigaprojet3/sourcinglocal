import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ role: null }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  // On renvoie le rôle même si l'utilisateur n'existe pas
  // (null = pas de compte → pas d'indicateur)
  return NextResponse.json({ role: user?.role ?? null });
}
