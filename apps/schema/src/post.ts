// todo: remove intersection commentes
// todo: test if adding refine to end of merge will work

import {chatSchema} from './chat';
import {locationSchema} from './location';
import {z} from 'zod';

const basePostSchema = z.object({
  cannotChat: z.boolean().optional(),
  chat: chatSchema.array().optional(),
  communities: z.array(z.string()).nonempty(),
  details: z.string().max(500).min(5),
  evergreen: z.boolean().optional(),
  feature: z.boolean().optional(),
  id: z.string(),
  location: locationSchema,
  photos: z.array(z.string()).optional().nullable(),
  servings: z.number().optional().nullable(),
  tags: z.array(z.enum([
    '-dairy',
    '-nuts',
    '+glutenFree',
    '+halal',
    '+kosher',
    '+vegan',
    '+vegetarian'
  ]))
  .optional()
  .nullable(),
  title: z.string().max(250).min(5),
  type: z.enum(['event']),
  userId: z.string()
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
});

export const postSchema = basePostSchema.merge(startsEndsAsDates).refine(
  (data) => data.ends > data.starts, {message: 'must end after starts'}
);

/*
export const postSchema = z.intersection(
  basePostSchema,
  startsEndsAsDates
);
*/

export const postCreateClientSchema = basePostSchema.omit({
  id: true,
  type: true,
  userId: true
}).merge(
  startsEndsAsStrings
)

/*
export const postCreateClientSchema = z.intersection(
  basePostSchema.omit({
    id: true,
    type: true,
    userId: true
  }),
  z.object({
    photos: z.array(z.instanceof(Blob)).optional().nullable()
  }),
  startsEndsAsStrings
);
*/


export const postCreateServerSchema = basePostSchema.omit({
  id: true,
  userId: true
}).merge(startsEndsAsStrings);

/*
export const postCreateServerSchema = z.intersection(
  basePostSchema.omit({
    id: true,
    userId: true
  }),
  startsEndsAsStrings
);
*/

export const postCloseSchema = basePostSchema.pick({
  id: true
});


export const postActionSchema = basePostSchema.pick({
  id: true
}).merge(z.object({
  value: z.any()
}));
/*
export const postActionSchema = z.intersection(
  basePostSchema.pick({
    id: true
  }),
  z.object({
    value: z.any()
  })
);
*/

export const postChatCreateSchema = z.object({
  postId: z.string(),
}).merge(chatSchema.pick({
  text: true
})
);


/*
export const postChatCreateSchema = z.intersection(
   z.object({
    postId: z.string(),
  }),
  chatSchema.pick({
    text: true
  })
);
*/
