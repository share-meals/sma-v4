import {
  BigQuery,
  InsertRowsResponse,
} from '@google-cloud/bigquery';
import {generateBigQueryClient} from './bigQueryClient';

type logSmartPantrySurveyResponse = (args: {
  surveyId: string,
  responseJson: string,
  userId: string,
  machineId: string
}) => Promise<InsertRowsResponse>;

// @ts-ignore
const SurveyResponseSchema = [
    {
	"name": "machineId",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "responseJson",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "surveyId",
	"type": "string",
	"mode": "required"
    },
    {
	"name": "timestamp",
	"type": "timestamp",
	"mode": "required"
    },
    {
	"name": "userId",
	"type": "string",
	"mode": "required"
    }
];


export const logSmartPantrySurveyResponse: logSmartPantrySurveyResponse = (args) => {
  if (process.env.FUNCTIONS_EMULATOR) {
    // emulator
    return new Promise((resolve) => {resolve});
  }
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
  itemNumber?: number,
  itemPrice?: number,
  machineId: string,
  status: 'approved' | 'canceled' | 'denied',
  userId: string,
}) => Promise<InsertRowsResponse>;

// @ts-ignore
const vendSchema = [
    {
	"name": "itemNumber",
	"type": "numeric",
	"mode": "nullable"
    },
    {
	"name": "itemPrice",
	"type": "numeric",
	"mode": "nullable"
    },
    {
	"name": "machineId",
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
	"name": "userId",
	"type": "string",
	"mode": "required"
    }
];

export const logSmartPantryVend: logSmartPantryVend = (args) => {
  if (process.env.FUNCTIONS_EMULATOR) {
    // emulator
    return new Promise((resolve) => resolve);
  }
  const bigQuery: BigQuery = generateBigQueryClient();
  return bigQuery
      .dataset('smsp')
      .table('vend')
      .insert({
        timestamp: new Date(),
        ...args,
      });  
}
