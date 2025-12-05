import { DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Doctor from "@/types/Doctor";
import { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Doctor>>
) {
  if (req.method === "GET") {
    const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const query = "SELECT * FROM Doctors WHERE DoctorID = ?;";
    const values = [doctorID];

    const [rows] = await conn.execute<Doctor[]>(query, values);

    conn.release();

    return res.status(200).json({
      data: rows[0] || {}
    });
  } else {
    return res.status(405).end();
  }
}
