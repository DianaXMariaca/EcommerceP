import { randomUUID } from "node:crypto";

// Punto único de integración con una pasarela de pago real en el futuro.
// Por ahora, simula una aprobación automática.
export async function processPayment(amount: number): Promise<{ approved: boolean; reference: string }> {
  return {
    approved: true,
    reference: `MOCK-${randomUUID()}`,
  };
}
