// internal

import {
  Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import {addCustomClaim} from '@/user/customClaim/add';
import {logUserCommunityAdd} from '@/log/user';

type addUserToCommunity = (args: {
  code?: string,
  communityId: string,
  ipAddress?: string,
  level: 'admin' | 'member', // todo: pull admin | member from schema
  userId: string,
}) => Promise<void>[];

export const addUserToCommunity: addUserToCommunity = ({
  code,
  communityId,
  ipAddress,
  level,
  userId,
}) => {
  const firestore: Firestore = getFirestore();
  const tasks: Promise<any>[] = [
    firestore.collection("users")
        .doc(userId)
        .update({[`private.communities.${communityId}`]: level}),
    addCustomClaim({
      id: userId,
      key: communityId,
      value: level,
    })
  ];
  if(!process.env.FUNCTIONS_EMULATOR){
    tasks.push(logUserCommunityAdd({
      code,
      communityId,
      ipAddress,
      level,
      userId,
    }));
  }
  return tasks;
};
