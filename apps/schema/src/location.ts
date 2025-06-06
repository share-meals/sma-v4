import {z} from 'zod';

export const latlngSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export type Latlng = z.infer<typeof latlngSchema>;

export const locationSchema = z.object({
  address: z.string()
  .nonempty({message: 'Required'}), // hackzorz for WherePicker
  name: z.string().optional(),
  room: z.string().optional()
})
.merge(latlngSchema);

export type Location = z.infer<typeof locationSchema>;
