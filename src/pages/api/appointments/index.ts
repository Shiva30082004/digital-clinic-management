import { CLINIC_ID_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Appointment from "@/types/Appointment";
import type { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Appointment | Appointment[]>>
) {
  // Get doctorID from headers 
  const doctorID = (req.headers[DOCTOR_ID_HEADER_KEY] as string);
  const clinicID = (req.headers[CLINIC_ID_HEADER_KEY] as string);

  
  if (req.method === "GET") {
    const { id } = req.query;

    const conn = await getDbConnection();
    if (!conn) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      if (id) {
        // Get single appointment when ID is provided
        const query = `
          SELECT 
            AppointmentID as appointmentID,
            AppointmentStatus as appointmentStatus,
            StartTime as startTime,
            EndTime as endTime,
            PatientID as patientID,
            DoctorID as doctorID
          FROM Appointments 
          WHERE AppointmentID = ? AND DoctorID = ?
        `;
        const values = [id, doctorID];
        const [rows] = await conn.execute<Appointment[]>(query, values);

        if (rows.length === 0) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({ data: rows[0] });
      } else {

        // Get all appointments for the doctor when no ID is provided
        const query = `
          SELECT 
            AppointmentID as appointmentID,
            AppointmentStatus as appointmentStatus,
            StartTime as startTime,
            EndTime as endTime,
            PatientID as patientID,
            DoctorID as doctorID
          FROM Appointments 
          WHERE DoctorID = ?
          ORDER BY StartTime DESC
        `;
        const values = [doctorID];
        const [rows] = await conn.execute<Appointment[]>(query, values);

        return res.status(200).json({ data: rows });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Failed to fetch appointments" });
    } finally {
      conn.release();
    }
  }

  // Create a new appointment
  else if (req.method === "POST") {
    const { appointmentStatus, startTime, endTime, patientID } = req.body;

    // Validations
    if (!appointmentStatus || !startTime || !endTime || !patientID) {
      return res.status(400).json({ 
        message: "Missing required fields: appointmentStatus, startTime, endTime, patientID" 
      });
    }

    const validStatuses = ["BKD", "ACT", "COM", "CAN"];
    if (!validStatuses.includes(appointmentStatus)) {
      return res.status(400).json({ 
        message: "Invalid appointment status. Must be one of: BKD, ACT, COM, CAN" 
      });
    }

    // Validate date format
    if (isNaN(Date.parse(startTime)) || isNaN(Date.parse(endTime))) {
      return res.status(400).json({ 
        message: "Invalid date format for startTime or endTime" 
      });
    }

    // Validate endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ 
        message: "endTime must be after startTime" 
      });
    }

    const conn = await getDbConnection();
    if (!conn) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      const query = `
        INSERT INTO Appointments 
        (AppointmentStatus, StartTime, EndTime, PatientID, DoctorID)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [appointmentStatus, startTime, endTime, patientID, doctorID];
      const [result] = await conn.execute<ResultSetHeader>(query, values);

      // Fetch the created appointment
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
      const [rows] = await conn.execute<Appointment[]>(selectQuery, [result.insertId]);

      return res.status(201).json({ 
        data: rows[0],
        message: "Appointment created successfully" 
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      return res.status(500).json({ message: "Failed to create appointment" });
    } finally {
      conn.release();
    }
  }

  // Update an existing appointment
  else if (req.method === "PUT") {
    const { id } = req.query;
    const { appointmentStatus, startTime, endTime, patientID } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    
    if (appointmentStatus) {
      const validStatuses = ["BKD", "ACT", "COM", "CAN"];
      if (!validStatuses.includes(appointmentStatus)) {
        return res.status(400).json({ 
          message: "Invalid appointment status. Must be one of: BKD, ACT, COM, CAN" 
        });
      }
    }

    
    if (startTime && isNaN(Date.parse(startTime))) {
      return res.status(400).json({ message: "Invalid date format for startTime" });
    }
    if (endTime && isNaN(Date.parse(endTime))) {
      return res.status(400).json({ message: "Invalid date format for endTime" });
    }

    
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ 
        message: "endTime must be after startTime" 
      });
    }

    const conn = await getDbConnection();
    if (!conn) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      if (appointmentStatus) {
        updates.push("AppointmentStatus = ?");
        values.push(appointmentStatus);
      }
      if (startTime) {
        updates.push("StartTime = ?");
        values.push(startTime);
      }
      if (endTime) {
        updates.push("EndTime = ?");
        values.push(endTime);
      }
      if (patientID !== undefined) {
        updates.push("PatientID = ?");
        values.push(patientID);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      values.push(id, doctorID);

      const query = `
        UPDATE Appointments 
        SET ${updates.join(", ")}
        WHERE AppointmentID = ? AND DoctorID = ?
      `;
      const [result] = await conn.execute<ResultSetHeader>(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          message: "Appointment not found or unauthorized" 
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
        message: "Appointment updated successfully" 
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      return res.status(500).json({ message: "Failed to update appointment" });
    } finally {
      conn.release();
    }
  }

  // Delete an appointment
  else if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const conn = await getDbConnection();
    if (!conn) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    try {
      const query = `
        DELETE FROM Appointments 
        WHERE AppointmentID = ? AND DoctorID = ?
      `;
      const values = [id, doctorID];
      const [result] = await conn.execute<ResultSetHeader>(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          message: "Appointment not found or unauthorized" 
        });
      }

      return res.status(200).json({ 
        message: "Appointment deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return res.status(500).json({ message: "Failed to delete appointment" });
    } finally {
      conn.release();
    }
  }

  // Method not allowed
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
