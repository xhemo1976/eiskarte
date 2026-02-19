import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const flavors = await prisma.flavor.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(flavors);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();
  const { name, price, ingredients, additives, allergens, available, sortOrder } = body;

  if (!name || price === undefined) {
    return NextResponse.json(
      { error: "Name und Preis sind erforderlich" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.flavor.aggregate({ _max: { sortOrder: true } });
  const nextOrder = sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

  const flavor = await prisma.flavor.create({
    data: {
      name,
      price: parseFloat(price),
      ingredients: ingredients ?? "",
      additives: additives ?? "",
      allergens: allergens ?? "",
      available: available ?? true,
      sortOrder: nextOrder,
    },
  });

  return NextResponse.json(flavor, { status: 201 });
}
