import {z} from 'zod';

export const latlngSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const locationSchema = z.object({
  address: z.string(),
  room: z.string()
})
.merge(latlngSchema)
.required({
  address: true,
  lat: true,
  lng: true
});
