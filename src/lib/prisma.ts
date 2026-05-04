import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function criarCliente() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Middleware de retry: tenta novamente em falhas de conexão transitórias
  client.$use(async (params, next) => {
    const MAX = 3;
    for (let i = 0; i < MAX; i++) {
      try {
        return await next(params);
      } catch (err: any) {
        const isTransient =
          err?.code === "P1001" ||   // banco inacessível
          err?.code === "P1008" ||   // timeout
          err?.code === "P1017" ||   // conexão fechada pelo servidor
          err?.message?.includes("Can't reach database") ||
          err?.message?.includes("Connection refused") ||
          err?.message?.includes("pool timeout");

        if (isTransient && i < MAX - 1) {
          await new Promise((r) => setTimeout(r, 600 * (i + 1)));
          continue;
        }
        throw err;
      }
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper para uso pontual com retry explícito (ex: Server Actions)
export async function withRetry<T>(
  fn: () => Promise<T>,
  tentativas = 3,
): Promise<T> {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTransient =
        err?.code === "P1001" ||
        err?.code === "P1008" ||
        err?.code === "P1017" ||
        err?.message?.includes("Can't reach database");
      if (isTransient && i < tentativas - 1) {
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Banco inacessível após múltiplas tentativas.");
}
