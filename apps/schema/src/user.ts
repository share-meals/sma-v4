import {by639_1} from 'iso-language-codes';
import {z} from 'zod';

// https://github.com/colinhacks/zod/discussions/839#discussioncomment-8142768
// todo: make this available elsewhere?
function getZodEnumFromObjectKeys<TI extends Record<string, any>, R extends string = TI extends Record<infer R, any> ? R : never>(input: TI): z.ZodEnum<[R, ...R[]]> {
    const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
    return z.enum([firstKey, ...otherKeys]);
}

export const languageType = getZodEnumFromObjectKeys(by639_1);

export const userSchema = z.object({
  email: z
  .string()
  .email(),

  language: languageType,
  
  name: z
  .string()
  .max(32),
  
  password: z
  .string()
  .max(32)
  .min(8)
});
