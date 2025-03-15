// leave all functions as async
// since it works better in the Promise.all workflow

import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';
import {shareSchema} from '@sma-v4/schema';
import {z} from 'zod';

type LogShareCreateParams = z.infer<typeof shareSchema>
			  & {
			   ipAddress?: string,
			   postId: string
			 }

type LogShareCreate = (args: LogShareCreateParams) => Promise<(void | InsertRowsResponse)[]>;

export const logShareCreate: LogShareCreate = async ({communities, ...data}) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  const now = new Date();
  const tasks: Promise<void | InsertRowsResponse>[] = [];
  for(const community of communities){
    tasks.push(
      bigQuery
      .dataset('app_analytics')
      .table('share')
      .insert({
	address: data.location.address,
	community: `community-${community}`,
	      ends: new Date(data.ends),
	      ipAddress: data.ipAddress,
	      lat: data.location.lat,
	      lng: data.location.lng,
	      locationName: data.location.name,
	      postId: data.postId,
	      room: data.location.room,
	      starts: new Date(data.starts),
	      swipes: data.swipes,
	      timestamp: now,
	      userId: data.userId
      })
      .catch((error: any) => {
	console.log(JSON.stringify(error));
      })
    );
  }
  return Promise.all(tasks); 
}
