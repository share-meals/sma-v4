import {locationSchema} from './location';
import {z} from 'zod';

export const communitySchema = z.object({
  center: locationSchema,
  codes: z.object({
    admin: z.string().array(),
    member: z.string().array()
  }),
  domains: z.string().array(),
  features: z.object({
    canShare: z.boolean(),
    canPost: z.boolean(),
    canSmartPantry: z.boolean()
  }),
  locations: locationSchema.array(),
  name: z.string(),
  id: z.string(),
  verified: z.boolean()
});
