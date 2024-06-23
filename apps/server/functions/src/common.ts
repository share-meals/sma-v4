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

interface AdminOrMemberOfSchema {
  communities: (typeof unfixedCommunityIdSchema)[],
  userId: string // todo: grab from @sma-v4/schema
}

type IsAdminOfSchema = (
  args: AdminOrMemberOfSchema
) => Promise<boolean>;

export const isAdminOf: IsAdminOfSchema = async({
  communities,
  userId,
}) => {
  const auth: Auth = getAuth();
  const user: UserRecord = await auth.getUser(userId);
  return communities
  .filter((c: typeof unfixedCommunityIdSchema) => {
    return user.customClaims ? user.customClaims[`community-${c}`] === 'admin' : false;
  })
  .length > 0;
};

type RequireAdminOfSchema = (
  args: AdminOrMemberOfSchema
) => Promise<void>;

export const requireAdminOf: RequireAdminOfSchema = async (props) => {
  if(!isAdminOf(props)){
    throw new HttpsError('unauthenticated', 'unauthenticated');
  }
};



type IsAdminOrMemberOfSchema = (
  args: AdminOrMemberOfSchema
) => Promise<boolean>;

export const isAdminOrMemberOf: IsAdminOrMemberOfSchema = async({
  communities,
  userId,
}) => {
  const auth: Auth = getAuth();
  const user: UserRecord = await auth.getUser(userId);
  return communities
  .filter((c: typeof unfixedCommunityIdSchema) => {
    return user.customClaims ? ['admin', 'member'].includes(user.customClaims[`community-${c}`]) : false;
  })
  .length > 0;
};


type RequireAdminOrMemberOfSchema = (
  args: AdminOrMemberOfSchema
) => Promise<void>;

export const requireAdminOrMemberOf: RequireAdminOrMemberOfSchema = async (props) => {
  if(!isAdminOrMemberOf(props)){
    throw new HttpsError('unauthenticated', 'unauthenticated');
  }
}
