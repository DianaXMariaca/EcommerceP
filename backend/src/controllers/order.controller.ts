import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processPayment } from "../lib/payment";

function generateTrackingId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TRK-${id}`;
}

export async function checkout(req: Request, res: Response) {
  const userId = req.user!.id;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        error: `Stock insuficiente para "${item.product.name}" (disponible: ${item.product.stock}, solicitado: ${item.quantity})`,
      });
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const payment = await processPayment(total);

  if (!payment.approved) {
    return res.status(400).json({ error: "El pago fue rechazado" });
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: "paid",
        total,
        trackingId: generateTrackingId(),
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
        payment: {
          create: {
            gatewayReference: payment.reference,
            status: "approved",
            amount: total,
          },
        },
      },
      include: { items: { include: { product: true } }, payment: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  res.status(201).json(order);
}

export async function listOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  res.json(orders);
}

export async function getOrderById(req: Request, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, payment: true },
  });

  if (!order || order.userId !== req.user!.id) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json(order);
}
