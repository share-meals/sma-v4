import {locationSchema} from './location';
import {z} from 'zod';

export const unfixedCommunityIdSchema = z.string();

export const fixedCommunityIdSchema = unfixedCommunityIdSchema.startsWith('community-');

export const communityCodeSchema = z
.string()
.min(5)
.max(50);

export const communitySchema = z.object({
  center: locationSchema.optional(),
  codes: z.object({
    admin: communityCodeSchema.array().optional(),
    member: communityCodeSchema.array().optional()
  }).optional(),
  colors: z.object({
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    type: z.enum(['dark', 'light'])
  }).array().optional(),
  domains: z.string().array().optional(),
  features: z.object({
    canChat: z.boolean().optional(),
    canPost: z.boolean().optional(),
    canPantryLink: z.boolean().optional(),
    canShare: z.boolean().optional(),
    mustWhitelistPost: z.boolean().optional()
  }),
  locations: locationSchema.array(),
  name: z.string(),
  id: unfixedCommunityIdSchema,
  verified: z.boolean()
});

export const membershipSchema = z.enum(['admin', 'member']);

export type Community = z.infer<typeof communitySchema>;
