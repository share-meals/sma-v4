import {
  Auth,
  getAuth,
  UserRecord,
} from "firebase-admin/auth";

type addCustomClaim = (args:
		       {id: string,
			key: string,
			value: string}) => Promise<void>;

export const addCustomClaim: addCustomClaim = async ({id, key, value}) => {
  const auth: Auth = getAuth();
  const user: UserRecord = await auth.getUser(id);
  return auth.setCustomUserClaims(
      id,
      {
        ...(user.customClaims || {}),
        [key]: value,
      });
};
