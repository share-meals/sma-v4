import {z} from 'zod';
import {locationSchema} from './location';


export const postSchema = z.object({
  cannot_chat: z.boolean(),
  communities: z.array(z.string()),
  details: z.string(),
  ends: z.number(),
  evergreen: z.boolean(),
  id: z.string(),
  location: locationSchema,
  starts: z.number(),
  title: z.string(),
  type: z.enum(['event']),
  user_id: z.string()
}).required({
  communities: true,
  details: true,
  end: true,
  id: true,
  location: true,
  starts: true,
  title: true,
  type: true,
  user_id: true
});
