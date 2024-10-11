import { StatusCodes } from 'http-status-codes';
import type { Mock } from 'vitest';

import {
  ICountryRepository,
  LocalCountryRepository,
} from '@/api/country/countryRepository';
import { Country } from '@prisma/client';
import { CountryService } from '@/api/country/countryService';

vi.mock('@/api/country/countryRepository');

vi.mock('@/server', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('countryService', () => {
  let countryServiceInstance: CountryService;
  let countryRepositoryInstance: ICountryRepository;

  const mockCountries: Country[] = [
    {
      id: 1,
      name: 'France',
      alpha_2_code: 'FR',
      alpha_3_code: 'FRA',
      nationality_name: 'French',
      nationality_name_composed: 'Franco',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    countryRepositoryInstance = new LocalCountryRepository();
    countryServiceInstance = new CountryService(countryRepositoryInstance);
  });

  describe('findMany', () => {
    it('return all countries', async () => {
      // Arrange
      (countryRepositoryInstance.findMany as Mock).mockResolvedValue(
        mockCountries
      );

      // Act
      const result = await countryServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toBe('Countries found');
      expect(result.data).toEqual(mockCountries);
    });

    it('returns a not found error for no countries found', async () => {
      // Arrange
      (countryRepositoryInstance.findMany as Mock).mockResolvedValue(null);

      // Act
      const result = await countryServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toBe('No Countries found');
      expect(result.data).toBeNull();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      (countryRepositoryInstance.findMany as Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await countryServiceInstance.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toBe(
        'An error occurred while retrieving countries.'
      );
      expect(result.data).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns a country for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const mockCountry = mockCountries.find(
        (country) => country.id === testId
      );
      (countryRepositoryInstance.findById as Mock).mockResolvedValue(
        mockCountry
      );

      // Act
      const result = await countryServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toBe('Country found');
      expect(result.data).toEqual(mockCountry);
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      const testId = 1;
      (countryRepositoryInstance.findById as Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Act
      const result = await countryServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toBe('An error occurred while finding country.');
      expect(result.data).toBeNull();
    });

    it('returns a not found error for non-existent ID', async () => {
      // Arrange
      const testId = 1;
      (countryRepositoryInstance.findById as Mock).mockResolvedValue(null);

      // Act
      const result = await countryServiceInstance.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toBe('Country not found');
      expect(result.data).toBeNull();
    });
  });
});
