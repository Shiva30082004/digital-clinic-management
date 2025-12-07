import { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import PatientVitals from "@/types/PatientVitals";
import { CLINIC_ID_HEADER_KEY } from "@/constants/auth";

function formatDateLocal(date: any): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


interface VitalsRow {
  HeartRate: number | string | null;
  RespiratoryRate: number | string | null;
  Temperature: number | string | null;
  SystolicBP: number | string | null;
  DiastolicBP: number | string | null;
  BloodOxygen: number | string | null;
  Height: number | string | null;
  Weight: number | string | null;
  ConsultationTime: Date;
}
function toNullableNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PatientVitals[]>>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }

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
      WHERE a.PatientID = ?
      ORDER BY a.StartTime DESC
      LIMIT 10
    `;

    const [rows] = await conn.execute(query, [patientId]);
    conn.release();

    const formatted: PatientVitals[] = (rows as VitalsRow[])
      .reverse()
      .map((r) => ({
        consultationTime: formatDateLocal(r.ConsultationTime),
        heartRate: toNullableNumber(r.HeartRate),
        respiratoryRate: toNullableNumber(r.RespiratoryRate),
        temperature: toNullableNumber(r.Temperature),
        systolicBp: toNullableNumber(r.SystolicBP),
        diastolicBp: toNullableNumber(r.DiastolicBP),
        bloodOxygen: toNullableNumber(r.BloodOxygen),
        height: toNullableNumber(r.Height),
        weight: toNullableNumber(r.Weight),
      }));


    return res.status(200).json({ data: formatted });
  } catch (err) {
    console.error("Vitals trend error:", err);
    try { conn.release(); } catch {}
    return res.status(500).json({ error: "Internal server error" });
  }
}