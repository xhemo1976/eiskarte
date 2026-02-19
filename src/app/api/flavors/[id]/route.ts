import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const flavor = await prisma.flavor.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.ingredients !== undefined && { ingredients: body.ingredients }),
      ...(body.additives !== undefined && { additives: body.additives }),
      ...(body.allergens !== undefined && { allergens: body.allergens }),
      ...(body.available !== undefined && { available: body.available }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });

  return NextResponse.json(flavor);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.flavor.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
