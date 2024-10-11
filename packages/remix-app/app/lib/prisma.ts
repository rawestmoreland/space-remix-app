import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrisma();
} else {
  // @ts-expect-error
  if (!global.prisma) {
    // @ts-expect-error
    global.prisma = createPrisma();
  }
  // @ts-expect-error
  prisma = global.prisma;
}

function createPrisma() {
  return new PrismaClient();
}

export default prisma;
