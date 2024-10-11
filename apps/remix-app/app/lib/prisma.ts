import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrisma();
} else {
  // @ts-expect-error globalThis is not defined in typescript
  if (!global.prisma) {
    // @ts-expect-error globalThis is not defined in typescript
    global.prisma = createPrisma();
  }
  // @ts-expect-error globalThis is not defined in typescript
  prisma = global.prisma;
}

function createPrisma() {
  return new PrismaClient();
}

export default prisma;
