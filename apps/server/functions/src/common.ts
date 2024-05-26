import {
  Auth,
  getAuth,
  UserRecord,
} from "firebase-admin/auth";
import {AuthData} from 'firebase-functions/v2/tasks';
import {
//  debug,
  error,
} from 'firebase-functions/logger';
import {
  functionsErrorCodes,
  unfixedCommunityIdSchema
} from '@sma-v4/schema';
import {HttpsError} from 'firebase-functions/v2/https';
import {
  ZodEffects,
  ZodIntersection,
  ZodObject,
} from 'zod';

export const requireAuthed = (auth: AuthData | undefined) => {
  if(!auth){
    throw new HttpsError('unauthenticated', 'unauthenticated');
  }else{

  }
}

interface ValidateSchema {
  data: {[key: string]: any},
  schema: ZodEffects<any> | ZodObject<any> | ZodIntersection<any, any>
};

export const validateSchema: (args: ValidateSchema) => void = ({data, schema}) => {
  if(!schema.safeParse(data).success){
    error('invalid-argument', data);
    throw new HttpsError(
      'invalid-argument',
      functionsErrorCodes.invalidArgumentSchema
    );
  }
};

interface AdminOfSchema {
  communities: (typeof unfixedCommunityIdSchema)[],
  user_id: string // todo: grab from @sma-v4/schema
}

type IsAdminOfSchema = (
  args: AdminOfSchema
) => Promise<boolean>;

type RequireAdminOfSchema = (
  args: AdminOfSchema
) => Promise<void>;

export const isAdminOf: IsAdminOfSchema = async({
  communities,
  user_id,
}) => {
  const auth: Auth = getAuth();
  const user: UserRecord = await auth.getUser(user_id);
  return communities
  .filter((c: typeof unfixedCommunityIdSchema) => {
    return user.customClaims ? user.customClaims[`community-${c}`] === 'admin' : false;
  })
  .length > 0;
};

export const requireAdminOf: RequireAdminOfSchema = async (props) => {
  if(!isAdminOf(props)){
    throw new HttpsError('unauthenticated', 'unauthenticated');
  }
};
