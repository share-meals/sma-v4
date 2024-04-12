import {locationSchema} from './location';
import {z} from 'zod';

const basePostSchema = z.object({
  cannot_chat: z.boolean().optional(),
  communities: z.array(z.string()).nonempty(),
  details: z.string().max(500).min(5),
  evergreen: z.boolean().optional(),
  id: z.string(),
  location: locationSchema,
  servings: z.number().optional().nullable(),
  tags: z.array(z.enum([
    '-dairy',
    '-nuts',
    '+gluten_free',
    '+halal',
    '+kosher',
    '+vegan',
    '+vegetarian'
  ]))
  .optional()
  .nullable(),
  title: z.string().max(250).min(5),
  type: z.enum(['event']),
  user_id: z.string()
});

const startsEndsAsStrings = z.object({
  ends: z.string(),
/*
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value ?? ''),
    {message: 'invalid format'},
  ),
  */
  starts: z.string()

  /*
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value),
    {message: 'invalid format'},
  ),
  */
})//.refine((data) => data.ends > data.starts, {path: ['ends'], message: 'must end after starts'});


const startsEndsAsDates = z.object({
  ends: z.date(),
  starts: z.date()
}).refine(
  (data) => data.ends > data.starts, {message: 'must end after starts'}
);

export const postSchema = z.intersection(
  basePostSchema,
  startsEndsAsDates
);

export const postCreateClientSchema = z.intersection(
  basePostSchema.omit({
    id: true,
    type: true,
    user_id: true
  }),
  startsEndsAsStrings
);

export const postCreateServerSchema = z.intersection(
  basePostSchema.omit({
    id: true,
    user_id: true
  }),
  startsEndsAsStrings
);
