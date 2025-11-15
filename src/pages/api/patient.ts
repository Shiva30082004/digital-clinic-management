// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getDbConnection } from "@/lib/database";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const conn = await getDbConnection();

  if (!conn) return res.status(500).end();

  const [rows] = await conn.query(
    "SELECT COUNT(*) AS count_patients FROM Patients;"
  );
  console.log("Current time from database:", rows);

  conn.release();

  res.status(200).json({ name: "John Doe" });
}
