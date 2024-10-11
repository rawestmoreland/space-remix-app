import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type Country = z.infer<typeof CountrySchema>;
export const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  alpha_2_code: z.string(),
  alpha_3_code: z.string(),
  nationality_name: z.string(),
  nationality_name_composed: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input Validation for 'GET countries/:id' endpoint
export const GetCountrySchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
