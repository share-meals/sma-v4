import {close} from './close';
import {create} from './create';
import {
  cullTriggered,
  cullScheduled,
} from './cull';
import {evergreen} from './evergreen';
import {feature} from './feature';

export const post = {
  close,
  create,
  cull: {
    triggered: cullTriggered,
    scheduled: cullScheduled
  },
  evergreen,
  feature
}
