import { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
// import PatientVitals from "@/types/PatientVitals";
import PatientVitals from "../../../types/PatientVitals";
import { CLINIC_ID_HEADER_KEY } from "@/constants/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PatientVitals[]>>
) {
  // VALIDATION 
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }

  //  DB CONNECTION 
  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  try {
    const query = `
      SELECT
        c.HeartRate,
        c.RespiratoryRate,
        c.Temperature,
        c.SystolicBP,
        c.DiastolicBP,
        c.BloodOxygen,
        c.Height,
        c.Weight,
        a.StartTime AS ConsultationTime
      FROM Consultations c
      JOIN Appointments a ON c.AppointmentID = a.AppointmentID
      WHERE a.PatientID = ? AND a.ClinicID = ?
      ORDER BY a.StartTime DESC
      LIMIT 10
    `;

    const values = [patientId, clinicId];

    const [rows] = await conn.execute(query, values);
    conn.release();

    const formatted = (rows as any[])
      .reverse() 
      .map((r) => ({
        consultationTime: r.ConsultationTime,
        heartRate: r.HeartRate,
        respiratoryRate: r.RespiratoryRate,
        temperature: r.Temperature,
        systolicBp: r.SystolicBP,
        diastolicBp: r.DiastolicBP,
        bloodOxygen: r.BloodOxygen,
        height: r.Height,
        weight: r.Weight,
      }));

    return res.status(200).json({ data: formatted });
  } catch (err) {
    console.error("Vitals trend error:", err);
    try { conn.release(); } catch {}

    return res.status(500).json({ error: "Internal server error" });
  }
}
