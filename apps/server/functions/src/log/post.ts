// leave all functions as async
// since it works better in the Promise.all workflow

import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';
import {postSchema} from '@sma-v4/schema';
import {z} from 'zod';

type LogPostCreateParams = z.infer<typeof postSchema>
			 & {
			   ip_address: string,
			   photos: any, // todo: implement photos
			   post_id: string
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
	ip_address: data.ip_address,
	lat: data.location.lat,
	lng: data.location.lng,
	location_name: data.location.name,
	photos: data.photos || [],
	post_id: data.post_id,
	room: data.location.room,
	servings: data.servings,
	starts: new Date(data.starts),
	tags: data.tags || [],
	timestamp: now,
	title: data.title,
	user_id: data.user_id
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
	console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks);
}
