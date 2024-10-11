import type { Country } from '@prisma/client';
import { PrismaClient } from 'database';

export interface ICountryRepository {
  findMany(): Promise<Country[]>;
  findById(id: number): Promise<Country | null>;
}

export const countries: Country[] = [
  {
    id: 1,
    name: 'France',
    alpha_2_code: 'FR',
    alpha_3_code: 'FRA',
    nationality_name: 'French',
    nationality_name_composed: 'Franco',
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
  },
];

export class LocalCountryRepository implements ICountryRepository {
  async findMany(): Promise<Country[]> {
    return countries;
  }

  async findById(id: number): Promise<Country | null> {
    return countries.find((country) => country.id === id) || null;
  }
}

export class PrismaCountryRepository implements ICountryRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findMany(): Promise<Country[]> {
    return await this.prisma.country.findMany();
  }

  async findById(id: number): Promise<Country | null> {
    return await this.prisma.country.findFirst({
      where: { id },
    });
  }
}
