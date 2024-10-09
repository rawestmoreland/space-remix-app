import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrisma();
} else {
  // @ts-expect-error globalThis
  if (!global.prisma) {
    // @ts-expect-error globalThis
    global.prisma = createPrisma();
  }
  // @ts-expect-error globalThis
  prisma = global.prisma;
}

function createPrisma() {
  return new PrismaClient();
}

export default prisma;
