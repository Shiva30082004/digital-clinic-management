import mysql from "mysql2/promise";
import { AuthTypes, Connector } from "@google-cloud/cloud-sql-connector";

// Enable Cloud SQL Admin and IAM Service Account Credentials API
// Create service account and give CloudSQL.Client, CloudSQL.InstanceUser roles

let connectionPool: mysql.Pool | null = null;

async function createDbConnectionPool() {
  const connector = new Connector();

  const clientOpts = await connector.getOptions({
    instanceConnectionName: `${process.env.PROJECT_ID}:${process.env.REGION}:${process.env.INSTANCE_NAME}`,
    authType: AuthTypes.IAM
  });

  connectionPool = mysql.createPool({
    ...clientOpts,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    connectionLimit: 10
  });
}

export async function getDbConnection() {
  if (!connectionPool) await createDbConnectionPool();

  return await connectionPool?.getConnection();
}
