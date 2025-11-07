import {z} from 'zod';

export const pantryLinkInfoSchema = z.object({
  name: z.string(),
  pointsToAward: z.number().min(1),
  surveyInterval: z.number().min(1),
  surveyJson: z.any()
  // TODO: add other info like location, image, etc
});

export type PantryLinkInfo = z.infer<typeof pantryLinkInfoSchema>;
