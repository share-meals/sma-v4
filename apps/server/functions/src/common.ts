import {AuthData} from 'firebase-functions/v2/tasks';
import {
//  debug,
  error,
} from 'firebase-functions/logger';
import {functionsErrorCodes} from '@sma-v4/schema';
import {HttpsError} from 'firebase-functions/v2/https';
import {
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
  schema: ZodObject<any> | ZodIntersection<any, any>
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
