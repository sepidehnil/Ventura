import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapDbProduct } from "@/lib/catalog";
import { parseProductRouteId } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const raw = decodeURIComponent(params.id ?? "");
  const { productId } = parseProductRouteId(raw);

  const productDb = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true, category: true },
  });

  if (!productDb) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: mapDbProduct(productDb) });
}
