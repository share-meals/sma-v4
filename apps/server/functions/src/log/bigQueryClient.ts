import {BigQuery} from "@google-cloud/bigquery";

export const generateBigQueryClient = (): BigQuery => {
  console.log(process.env);
  if (process.env.FUNCTIONS_EMULATOR) {
    // emulator
    return new BigQuery({
      projectId: "share-meals-dev",
      credentials: JSON.parse(process.env.SM_DEV_SERVICE_ACCOUNT!),
    });
  } else {
    // deployed
    return new BigQuery();
  }
};
