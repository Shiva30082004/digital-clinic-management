import { DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const doctorId = req.headers[DOCTOR_ID_HEADER_KEY] as string;

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const query =
      "SELECT procedureName, COUNT(ProcedureID) AS timesPerformed FROM ConsultationProcedures NATURAL JOIN Procedures NATURAL JOIN Consultations NATURAL JOIN Appointments WHERE AppointmentStatus = 'COM' AND DoctorID = ? GROUP BY procedureName HAVING COUNT(ProcedureID) > 0 ORDER BY timesPerformed DESC LIMIT 3;";
    const values = [doctorId];

    const [rows] = await conn.execute(query, values);

    conn.release();

    return res.status(200).json({
      data: rows || {}
    });
  } else {
    return res.status(405).end();
  }
}
