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
        emailDomain: emailDomain.toLowerCase(),
        ipAddress: ipAddress,
        timestamp: new Date(),
        userId: userId,
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
        userId: userId,
        timestamp: new Date(),
        action: 'add',
        community: communityId,
        ipAddress: ipAddress,
        code: code,
        level: level,
      });
};

type logUserCommunityRemove = (args: {
  communityId: string,
  ipAddress?: string,
  userId: string
}) => Promise<InsertRowsResponse>

export const logUserCommunityRemove: logUserCommunityRemove = ({
  communityId,
  ipAddress,
  userId,
}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('app_analytics')
      .table('user_community')
      .insert({
        userId: userId,
        timestamp: new Date(),
        action: 'remove',
        community: communityId,
        ipAddress: ipAddress,
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
    ipAddress,
    platform,
    reason,
    timestamp: new Date(),
    userId: uid,
  }).catch((error:any) => {
    console.log(JSON.stringify(error));
  });
};

type logUserAction = (args: {
  action: string,
  communities: string[],
  ipAddress: string,
  payload: string,
  userId: string,
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
