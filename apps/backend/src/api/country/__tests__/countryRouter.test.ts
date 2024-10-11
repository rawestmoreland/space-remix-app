import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import type { Country } from '@prisma/client';
import { countries } from '@/api/country/countryRepository';
import type { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

describe('Country API Endpoints', () => {
  describe('GET /countries', () => {
    it('should return a list of countries', async () => {
      // Act
      const response = await request(app).get('/countries');
      const responseBody: ServiceResponse<Country[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Countries found');
      expect(responseBody.data.length).toEqual(countries.length);
      responseBody.data.forEach((country, index) =>
        compareCountries(countries[index] as Country, country)
      );
    });
  });

  describe('GET /countries/:id', () => {
    it('should return a country for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const expectedCountry = countries.find(
        (country) => country.id === testId
      ) as Country;

      // Act
      const response = await request(app).get(`/countries/${testId}`);

      const responseBody: ServiceResponse<Country> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Country found');
      if (!expectedCountry)
        throw new Error('Invalid test data: expectedcountry is undefined');
      compareCountries(expectedCountry, responseBody.data);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const testId = Number.MAX_SAFE_INTEGER;

      // Act
      const response = await request(app).get(`/countries/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Country not found');
      expect(responseBody.data).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Act
      const invalidInput = 'abc';
      const response = await request(app).get(`/countries/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.data).toBeNull();
    });
  });
});

function compareCountries(mockCountry: Country, responseCountry: Country) {
  if (!mockCountry || !responseCountry) {
    throw new Error(
      'Invalid test data: mockCountry or responseCountry is undefined'
    );
  }

  expect(responseCountry.id).toEqual(mockCountry.id);
  expect(responseCountry.name).toEqual(mockCountry.name);
  expect(responseCountry.alpha_2_code).toEqual(mockCountry.alpha_2_code);
  expect(responseCountry.alpha_3_code).toEqual(mockCountry.alpha_3_code);
  expect(new Date(responseCountry.createdAt)).toEqual(mockCountry.createdAt);
  expect(new Date(responseCountry.updatedAt)).toEqual(mockCountry.updatedAt);
}
