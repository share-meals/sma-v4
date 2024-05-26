import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';

type logUserCreate = (args: {
  emailDomain: string,
  ipAddress?: string,
  userId: string
}) => Promise<void | InsertRowsResponse>;

export const logUserCreate: logUserCreate = ({
  emailDomain,
  ipAddress,
  userId,
}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('app_analytics')
      .table('user_create')
      .insert({
        email_domain: emailDomain.toLowerCase(),
        ip_address: ipAddress,
        timestamp: new Date(),
        user_id: userId,
      }).catch((error:any) => {
	console.log(JSON.stringify(error));
      });
};

type logUserCommunityAdd = (args: {
  code?: string,
  communityId: string,
  ipAddress?: string,
  level: 'admin' | 'member',
  userId: string
}) => Promise<InsertRowsResponse>

export const logUserCommunityAdd: logUserCommunityAdd = ({
  code,
  communityId,
  ipAddress,
  level,
  userId,
}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('app_analytics')
      .table('user_community')
      .insert({
        user_id: userId,
        timestamp: new Date(),
        action: 'add',
        community: communityId,
        ip_address: ipAddress,
        code: code,
        level: level,
      });
};

type logMessagingTokenAction = (args: {
  action: 'create' | 'delete',
  ipAddress?: string,
  platform: 'android' | 'ios' | 'web',
  reason?: string,
  uid: string,
}) => Promise<void | InsertRowsResponse>;

export const logMessagingTokenAction: logMessagingTokenAction = ({
  action,
  ipAddress,
  platform,
  reason,
  uid
}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
  .dataset('app_analytics')
  .table('messaging_tokens')
  .insert({
    action,
    ip_address: ipAddress,
    platform,
    reason,
    timestamp: new Date(),
    user_id: uid,
  }).catch((error:any) => {
    console.log(JSON.stringify(error));
  });
};

type logUserAction = (args: {
  action: string,
  communities: string[],
  ip_address: string,
  payload: string,
  user_id: string,
}) => Promise<any>;


export const logUserAction: logUserAction = async ({communities, ...data}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  const now = new Date();
  const tasks: Promise<void | InsertRowsResponse>[] = [];
  for(const community of communities){
    tasks.push(
      bigQuery
      .dataset('app_analytics')
      .table('user_action')
      .insert({
	community,
	timestamp: now,
	...data
      })
      .catch((error: any) => {
	console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks);
}
