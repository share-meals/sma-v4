import {
  Auth,
  getAuth,
  UserRecord,
} from "firebase-admin/auth";

type removeCustomClaim = (args: {
  id: string,
  key: string
}) => Promise<void>;

export const removeCustomClaim: removeCustomClaim = async ({id, key}) => {
  const auth: Auth = getAuth();
  const user: UserRecord = await auth.getUser(id);
  const existingClaims = user.customClaims || {};
  delete existingClaims[key];
  return auth.setCustomUserClaims(
      id,
      existingClaims
  );
};
