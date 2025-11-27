import { CLINIC_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Clinic from "@/types/Clinic";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Clinic>>
) {
  if (req.method === "GET") {
    const clinicID = req.headers[CLINIC_ID_HEADER_KEY] as string;

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const query = "SELECT * FROM Clinics WHERE ClinicID = ?;";
    const values = [clinicID];

    const [rows] = await conn.execute<Clinic[]>(query, values);

    conn.release();

    return res.status(200).json({
      data: rows[0] || {}
    });
  } else {
    return res.status(405).end();
  }
}
