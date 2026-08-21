import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function listProducts(req: Request, res: Response) {
  const { category, brand, minPrice, maxPrice, take, skip } = req.query;

  const where: Prisma.ProductWhereInput = {};

  if (typeof category === "string") {
    where.category = category;
  }
  if (typeof brand === "string") {
    where.brand = brand;
  }
  if (typeof minPrice === "string" || typeof maxPrice === "string") {
    where.price = {};
    if (typeof minPrice === "string") {
      where.price.gte = new Prisma.Decimal(minPrice);
    }
    if (typeof maxPrice === "string") {
      where.price.lte = new Prisma.Decimal(maxPrice);
    }
  }

  const products = await prisma.product.findMany({
    where,
    take: take ? Number(take) : 20,
    skip: skip ? Number(skip) : 0,
  });

  res.json(products);
}

export async function getProductById(req: Request, res: Response) {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
}
