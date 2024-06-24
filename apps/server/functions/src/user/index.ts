import {close} from './close';
import {community} from './community';
import {create} from './create';
import {logPostView} from './logPostView';
import {messagingToken} from './messagingToken';
import {profile} from './profile';

export const user = {
  close,
  community,
  create,
  log: {
    post: {
      view: logPostView
    }
  },
  messagingToken,
  profile,
};
