import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getSummary(req: Request, res: Response) {
  const [salesAgg, orderCount, userCount] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { not: "pending" } },
      _sum: { total: true },
    }),
    // Cuenta todas las órdenes, incluidas las pendientes (a diferencia de totalSales).
    prisma.order.count(),
    prisma.user.count(),
  ]);

  res.json({
    totalSales: salesAgg._sum.total ?? 0,
    orderCount,
    userCount,
  });
}
