import {BigQuery} from "@google-cloud/bigquery";

export const generateBigQueryClient = (): BigQuery => {
  if (process.env.FUNCTIONS_EMULATOR) {
    // emulator
    return new BigQuery({
      projectId: "share-meals-dev",
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!),
    });
  } else {
    // deployed
    return new BigQuery();
  }
};
