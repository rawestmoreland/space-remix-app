export * from '@prisma/client';

declare global {
  namespace PrismaJson {
    // you can use classes, interfaces, types, etc.
    type CustomFields = Record<string, string>;
  }
}
