import { DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment[]>>
) {
  const doctorID = (req.headers[DOCTOR_ID_HEADER_KEY] as string) || (req.query.doctorId as string);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { status } = req.query;

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        AppointmentID as appointmentID,
        AppointmentStatus as appointmentStatus,
        StartTime as startTime,
        EndTime as endTime,
        PatientID as patientID,
        DoctorID as doctorID
      FROM Appointments 
      WHERE DoctorID = ?
        AND DATE(StartTime) = ?
    `;
    
    const values: any[] = [doctorID, today];

    if (status) {
      const validStatuses = ["BKD", "ACT", "COM", "CAN"];
      if (!validStatuses.includes(status as string)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be one of: BKD, ACT, COM, CAN" 
        });
      }
      query += " AND AppointmentStatus = ?";
      values.push(status);
    }

    query += " ORDER BY StartTime ASC";

    const [rows] = await conn.execute<Appointment[]>(query, values);

    return res.status(200).json({ 
      data: rows,
      message: `Found ${rows.length} appointments for today` 
    });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  } finally {
    conn.release();
  }
}
