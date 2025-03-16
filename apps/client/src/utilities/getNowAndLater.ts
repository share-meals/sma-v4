import {
  addHours,
  formatISO,
  roundToNearestMinutes
} from 'date-fns';

export const getNowAndLater = () => {
  const now = roundToNearestMinutes(new Date(), {nearestTo: 15, roundingMethod: 'floor'});
  const hourFromNow = addHours(now, 1);
  return [formatISO(now).slice(0, -6), formatISO(hourFromNow).slice(0, -6)];
}
