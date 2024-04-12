import {locationSchema} from './location';
import {z} from 'zod';

export const unfixedCommunityIdSchema = z.string();

export const fixedCommunityIdSchema = unfixedCommunityIdSchema.startsWith('community-');

export const communitySchema = z.object({
  center: locationSchema.optional(),
  codes: z.object({
    admin: z.string().array().optional(),
    member: z.string().array().optional()
  }).optional(),
  colors: z.object({
    color: z.string(),
    type: z.enum(['dark', 'light'])
  }).array().optional(),
  domains: z.string().array(),
  features: z.object({
    canShare: z.boolean(),
    canPost: z.boolean(),
    canSmartPantry: z.boolean(),
    mustWhitelistPost: z.boolean()
  }),
  locations: locationSchema.array(),
  name: z.string(),
  id: unfixedCommunityIdSchema,
  verified: z.boolean()
});

export const myMembershipSchema = z.enum(['admin', 'member']);
