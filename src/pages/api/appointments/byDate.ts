import { DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment[]>>
) {
  // Get doctorID from headers (production) or query params (testing)
  const doctorID = (req.headers[DOCTOR_ID_HEADER_KEY] as string) || (req.query.doctorId as string);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { startDate, endDate, status } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ 
      message: "Both startDate and endDate are required" 
    });
  }

  if (isNaN(Date.parse(startDate as string)) || isNaN(Date.parse(endDate as string))) {
    return res.status(400).json({ 
      message: "Invalid date format. Use YYYY-MM-DD" 
    });
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  try {
    // Build query with optional status filter
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
        AND DATE(StartTime) >= ?
        AND DATE(StartTime) <= ?
    `;
    
    const values: any[] = [doctorID, startDate, endDate];

    // Add status filter if provided
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
      message: `Found ${rows.length} appointments` 
    });
  } catch (error) {
    console.error("Error fetching appointments by date:", error);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  } finally {
    conn.release();
  }
}
