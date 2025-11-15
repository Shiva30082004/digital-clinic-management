// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getDbConnection } from "@/lib/database";
import Patient from "@/types/Patient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Patient[]>
) {
  const conn = await getDbConnection();

  if (!conn) return res.status(500).end();

  const [rows] = await conn.query(
    "SELECT PatientID as id, CONCAT(FirstName, ' ', LastName) AS name, TIMESTAMPDIFF(YEAR, DateOfBirth, CURDATE()) AS age FROM Patients WHERE ClinicID = 238;"
  );

  conn.release();

  res.status(200).json(rows as Patient[]);
}
