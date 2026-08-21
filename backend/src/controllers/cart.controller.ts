import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getCart(req: Request, res: Response) {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: { product: true },
  });

  res.json(items);
}

async function assertStockAvailable(productId: string, res: Response) {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    res.status(400).json({ error: "El producto no existe" });
    return null;
  }
  if (product.stock <= 0) {
    res.status(400).json({ error: "El producto no tiene stock disponible" });
    return null;
  }
  return product;
}

export async function addItem(req: Request, res: Response) {
  const { productId, quantity } = req.body;

  if (typeof productId !== "string" || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ error: "productId y quantity (> 0) son requeridos" });
  }

  const product = await assertStockAvailable(productId, res);
  if (!product) return;

  const userId = req.user!.id;

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
    include: { product: true },
  });

  res.status(201).json(item);
}

export async function removeItem(req: Request, res: Response) {
  const { id } = req.params;

  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.userId !== req.user!.id) {
    return res.status(404).json({ error: "Item de carrito no encontrado" });
  }

  await prisma.cartItem.delete({ where: { id } });
  res.status(204).send();
}

export async function updateQuantity(req: Request, res: Response) {
  const { id } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number") {
    return res.status(400).json({ error: "quantity es requerido" });
  }

  const item = await prisma.cartItem.findUnique({ where: { id } });
  if (!item || item.userId !== req.user!.id) {
    return res.status(404).json({ error: "Item de carrito no encontrado" });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    return res.status(204).send();
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: { product: true },
  });

  res.json(updated);
}

export async function mergeCart(req: Request, res: Response) {
  const items = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Se espera un array de { productId, quantity }" });
  }

  const userId = req.user!.id;

  for (const { productId, quantity } of items) {
    if (typeof productId !== "string" || typeof quantity !== "number" || quantity <= 0) {
      continue;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.stock <= 0) {
      continue;
    }

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId, productId, quantity },
    });
  }

  const merged = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  res.json(merged);
}
