import {community} from './community';
import {create} from './create';
import {logPostView} from './logPostView';
import {messagingToken} from './messagingToken';

export const user = {
  community,
  create,
  log: {
    post: {
      view: logPostView
    }
  },
  messagingToken
};
