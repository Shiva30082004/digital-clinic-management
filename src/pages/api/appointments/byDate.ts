import { DOCTOR_ID_HEADER_KEY, CLINIC_ID_HEADER_KEY, ROLE_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment[]>>
) {
  // Get user info from headers (production) or query params (testing)
  const doctorID = (req.headers[DOCTOR_ID_HEADER_KEY] as string);
  const clinicID = (req.headers[CLINIC_ID_HEADER_KEY] as string);
  const role = (req.headers[ROLE_HEADER_KEY] as string);

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
    // Build query with optional status filter - JOIN with Patients table for names
    let query = `
      SELECT 
        a.AppointmentID as appointmentID,
        a.AppointmentStatus as appointmentStatus,
        a.StartTime as startTime,
        a.EndTime as endTime,
        a.PatientID as patientID,
        a.DoctorID as doctorID,
        p.FirstName as patientFirstName,
        p.LastName as patientLastName
      FROM Appointments a
      LEFT JOIN Patients p ON a.PatientID = p.PatientID
    `;
    
    const values: any[] = [];

    // Filter based on role
    if (role === 'admin') {
      // Admin: filter by clinicID (get all appointments for the clinic)
      query += `
      WHERE a.DoctorID IN (SELECT DoctorID FROM Doctors WHERE ClinicID = ?)
        AND DATE(a.StartTime) >= ?
        AND DATE(a.StartTime) <= ?
      `;
      values.push(clinicID, startDate, endDate);
    } else {
      // Doctor: filter by doctorID
      query += `
      WHERE a.DoctorID = ?
        AND DATE(a.StartTime) >= ?
        AND DATE(a.StartTime) <= ?
      `;
      values.push(doctorID, startDate, endDate);
    }

    // Add status filter if provided
    if (status) {
      const validStatuses = ["BKD", "ACT", "COM", "CAN"];
      if (!validStatuses.includes(status as string)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be one of: BKD, ACT, COM, CAN" 
        });
      }
      query += " AND a.AppointmentStatus = ?";
      values.push(status);
    }

    query += " ORDER BY a.StartTime ASC";

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
