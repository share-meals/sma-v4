import {create} from './create';
import {
//  cullTriggered,
  cullScheduled,
} from './cull';

export const post = {
  create,
  cull: {
//    triggered: cullTriggered,
    scheduled: cullScheduled
  }
}
