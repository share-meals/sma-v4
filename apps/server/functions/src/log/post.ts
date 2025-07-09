// leave all functions as async
// since it works better in the Promise.all workflow

import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';
import {postSchema} from '@sma-v4/schema';
import {z} from 'zod';

interface LogPostChatCreateArgs {
  communities: string[],
  ipAddress?: string,
  postId: string,
  text: string,
  userId: string
};

type LogPostChatCreate = (args: LogPostChatCreateArgs) => Promise<(void | InsertRowsResponse)[]>;

export const logPostChatCreate: LogPostChatCreate = async ({communities, ...data}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  const now = new Date();
  const tasks: Promise<void | InsertRowsResponse>[] = [];
  for(const community of communities){
    tasks.push(
      bigQuery
      .dataset('app_analytics')
      .table('post_chat')
      .insert({
	community: `community-${community}`,
	      ipAddress: data.ipAddress,
	      postId: data.postId,
	      text: data.text,
	      timestamp: now,
	      userId: data.userId
      })
      .catch((error: any) => {
	console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks); 
};

type LogPostCreateParams = z.infer<typeof postSchema>
			 & {
			   ipAddress?: string,
			   photos: any, // todo: implement photos
			   postId: string
			 }

type LogPostCreate = (args: LogPostCreateParams) => Promise<(void | InsertRowsResponse)[]>;

export const logPostCreate: LogPostCreate = async ({communities, ...data}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  const now = new Date();
  const tasks: Promise<void | InsertRowsResponse>[] = [];
  for(const community of communities){
    tasks.push(
      bigQuery
      .dataset('app_analytics')
      .table('post')
      .insert({
	address: data.location.address,
	community: `community-${community}`,
	      details: data.details,
	      ends: new Date(data.ends),
	      ipAddress: data.ipAddress,
	      lat: data.location.lat,
	      lng: data.location.lng,
	      locationName: data.location.name,
	      photos: data.photos || [],
	      postId: data.postId,
	      room: data.location.room,
	      servings: data.servings,
	      starts: new Date(data.starts),
	      tags: data.tags || [],
	      timestamp: now,
	      title: data.title,
	      userId: data.userId
      })
      .catch((error: any) => {
	console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks); 
}

export const logPostView = async ({communities, ...data}: any) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  const now = new Date();
  const tasks: Promise<void | InsertRowsResponse>[] = [];
  for(const community of communities){
    tasks.push(
      bigQuery
      .dataset('app_analytics')
      .table('user_post_view')
      .insert({
	community,
	timestamp: now,
	...data
      })
      .catch((error: any) => {
	console.log(error);
	//console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks);
}
