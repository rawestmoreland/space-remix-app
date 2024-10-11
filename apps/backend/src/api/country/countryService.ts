import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { Country } from '@prisma/client';
import { ICountryRepository } from '@/api/country/countryRepository';

export class CountryService {
  constructor(private countryRepository: ICountryRepository) {}

  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<Country[] | null>> {
    try {
      const countries = await this.countryRepository.findMany();
      if (!countries || countries.length === 0) {
        return ServiceResponse.failure(
          'No Countries found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<Country[]>('Countries found', countries);
    } catch (ex) {
      const errorMessage = `Error finding all countries: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving countries.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single country by their ID
  async findById(id: number): Promise<ServiceResponse<Country | null>> {
    try {
      const country = await this.countryRepository.findById(id);
      if (!country) {
        return ServiceResponse.failure(
          'Country not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success<Country>('Country found', country);
    } catch (ex) {
      const errorMessage = `Error finding country with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding country.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
