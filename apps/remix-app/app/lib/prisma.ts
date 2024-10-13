import { PrismaClient } from '@repo/database';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrisma();
} else {
  if (!global.prisma) {
    global.prisma = createPrisma();
  }
  prisma = global.prisma;
}

function createPrisma() {
  return new PrismaClient();
}

export default prisma;
