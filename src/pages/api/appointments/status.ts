import { DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment>>
) {
  // Get doctorID from headers (production)
  const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const { appointmentStatus } = req.body;

  // Validation
  if (!id) {
    return res.status(400).json({ error: "Appointment ID is required" });
  }

  if (!appointmentStatus) {
    return res.status(400).json({ error: "appointmentStatus is required" });
  }

  const validStatuses = ["BKD", "ACT", "COM", "CAN"];
  if (!validStatuses.includes(appointmentStatus)) {
    return res.status(400).json({
      error:
        "Invalid status. Must be one of: BKD (Booked), ACT (Active), COM (Completed), CAN (Cancelled)"
    });
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  try {
    // Update appointment status
    const query = `
      UPDATE Appointments 
      SET AppointmentStatus = ?
      WHERE AppointmentID = ? AND DoctorID = ?
    `;
    const values = [appointmentStatus, id, doctorID];
    const [result] = await conn.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Appointment not found or unauthorized"
      });
    }

    // Fetch the updated appointment
    const selectQuery = `
      SELECT 
        AppointmentID as appointmentID,
        AppointmentStatus as appointmentStatus,
        StartTime as startTime,
        EndTime as endTime,
        PatientID as patientID,
        DoctorID as doctorID
      FROM Appointments 
      WHERE AppointmentID = ?
    `;
    const [rows] = await conn.execute<Appointment[]>(selectQuery, [id]);

    return res.status(200).json({
      data: rows[0],
      message: `Appointment status updated to ${appointmentStatus}`
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res
      .status(500)
      .json({ error: "Failed to update appointment status" });
  } finally {
    conn.release();
  }
}
