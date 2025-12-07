import { DOCTOR_ID_HEADER_KEY, CLINIC_ID_HEADER_KEY, ROLE_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment[]>>
) {
  // Get user info from headers (production)
  const doctorID = (req.headers[DOCTOR_ID_HEADER_KEY] as string);
  const clinicID = (req.headers[CLINIC_ID_HEADER_KEY] as string);
  const role = (req.headers[ROLE_HEADER_KEY] as string);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { patientId } = req.query;

  if (!patientId) {
    return res.status(400).json({ 
      message: "patientId is required" 
    });
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  try {
    let query: string;
    let values: any[];

    // Filter based on role
    if (role === 'admin') {
      // Admin: Get all appointments for this patient in the clinic
      query = `
        SELECT 
          AppointmentID as appointmentID,
          AppointmentStatus as appointmentStatus,
          StartTime as startTime,
          EndTime as endTime,
          PatientID as patientID,
          DoctorID as doctorID
        FROM Appointments 
        WHERE PatientID = ?
          AND DoctorID IN (SELECT DoctorID FROM Doctors WHERE ClinicID = ?)
        ORDER BY StartTime DESC
      `;
      values = [patientId, clinicID];
    } else {
      // Doctor: Get only appointments for this patient with this specific doctor
      query = `
        SELECT 
          AppointmentID as appointmentID,
          AppointmentStatus as appointmentStatus,
          StartTime as startTime,
          EndTime as endTime,
          PatientID as patientID,
          DoctorID as doctorID
        FROM Appointments 
        WHERE PatientID = ? AND DoctorID = ?
        ORDER BY StartTime DESC
      `;
      values = [patientId, doctorID];
    }
    
    const [rows] = await conn.execute<Appointment[]>(query, values);

    return res.status(200).json({ 
      data: rows,
      message: `Found ${rows.length} appointments for patient ${patientId}` 
    });
  } catch (error) {
    console.error("Error fetching appointments by patient:", error);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  } finally {
    conn.release();
  }
}
