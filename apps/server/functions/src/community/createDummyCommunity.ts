// note: should NOT be exposed as endpoint

import {
  DocumentData,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

type createDummyCommunity = (emailDomain: string) => Promise<string>;

export const createDummyCommunity: createDummyCommunity = async (emailDomain) => {
  const firestore: Firestore = getFirestore();
  const normalizedEmailDomain: string = emailDomain.toLowerCase();
  const result: DocumentReference<DocumentData, DocumentData> = await firestore.collection("communities").add({
    domains: [normalizedEmailDomain],
    features: {
      canPost: false,
      canShare: false,
      canSmartPantry: false,
      mustWhitelistPost: false,
    },
    name: normalizedEmailDomain,
    verified: false,
  });
  return result.id;
};
