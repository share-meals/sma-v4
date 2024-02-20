import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';

type logSmartPantrySurveyResponse = (args: {
  survey_id: string,
  response_json: string,
  user_id: string,
  machine_id: string
}) => Promise<InsertRowsResponse>;

// @ts-ignore
const SurveyResponseSchema = [
    {
	"name": "machine_id",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "response_json",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "survey_id",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "timestamp",
	"type": "timestamp",
	"mode": "required"
    },
    {
	"name": "user_id",
	"type": "string",
	"mode": "required"
    }
];


export const logSmartPantrySurveyResponse: logSmartPantrySurveyResponse = (args) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('smsp')
      .table('survey_response')
      .insert({
        timestamp: new Date(),
        ...args,
      });
};

type logSmartPantryVend = (args: {
  item_number?: number,
  item_price?: number,
  machine_id: string,
  status: 'approved' | 'canceled' | 'denied',
  user_id: string,
}) => Promise<InsertRowsResponse>;

// @ts-ignore
const vendSchema = [
    {
	"name": "item_number",
	"type": "numeric",
	"mode": "nullable"
    },
    {
	"name": "item_price",
	"type": "numeric",
	"mode": "nullable"
    },
    {
	"name": "machine_id",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "status",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "timestamp",
	"type": "timestamp",
	"mode": "required"
    },
    {
	"name": "user_id",
	"type": "string",
	"mode": "required"
    }
];

export const logSmartPantryVend: logSmartPantryVend = (args) => {
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('smsp')
      .table('vend')
      .insert({
        timestamp: new Date(),
        ...args,
      });  
}
