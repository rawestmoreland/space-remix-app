import { PrismaClient } from '@prisma/client';
import { CountryService } from './countryService';
import {
  LocalCountryRepository,
  PrismaCountryRepository,
} from '@/api/country/countryRepository';

export function createCountryService(): CountryService {
  if (process.env.NODE_ENV === 'test') {
    return new CountryService(new LocalCountryRepository());
  } else {
    const prisma = new PrismaClient();
    return new CountryService(new PrismaCountryRepository(prisma));
  }
}

export const countryService = createCountryService();
