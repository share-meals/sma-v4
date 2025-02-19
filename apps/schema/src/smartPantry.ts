import {z} from 'zod';

export const smartPantryInfoSchema = z.object({
  name: z.string(),
  surveyInterval: z.number().min(1),
  surveyJson: z.any()
  // TODO: add other info like location, image, etc
});

export type SmartPantryInfo = z.infer<typeof smartPantryInfoSchema>;
