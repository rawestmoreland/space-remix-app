import type { Request, RequestHandler, Response } from 'express';

import { countryService } from '@/api/country/countryServiceFactory';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

class CountryController {
  public getCountries: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await countryService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getCountry: RequestHandler = async (_req: Request, res: Response) => {
    const { id } = _req.params;
    const serviceResponse = await countryService.findById(Number(id));
    return handleServiceResponse(serviceResponse, res);
  };
}

export const countryController = new CountryController();
