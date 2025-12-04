
import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Consultation from "@/types/Consultation";

type ConsultationResponse = ApiResponse<Consultation | Consultation[]>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
    switch (req.method) {
      case "GET": {
        const { consultationID, appointmentID } = req.query;

        let query = "SELECT * FROM Consultations";
        const conditions: string[] = [];
        const params: any[] = [];

        if (consultationID) {
          conditions.push("ConsultationID = ?");
          params.push(consultationID);
        }
        if (appointmentID) {
          conditions.push("AppointmentID = ?");
          params.push(appointmentID);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }

        const [rows] = await conn.execute<Consultation[]>(query, params);

        return res.status(200).json({
          data: consultationID ? rows[0] : rows
        } as ConsultationResponse);
      }
      case "POST": {
        const {
          appointmentID,
          heartRate,
          respiratoryRate,
          temperature,
          bloodOxygen,
          systolicBP,
          diastolicBP,
          weight,
          height,
          chiefComplaints,
          diagnosis
        } = req.body;

        if (!appointmentID) {
          return res.status(400).json({
            error: "appointmentID is required"
          } as ConsultationResponse);
        }

        const [result]: any = await conn.execute(
          `INSERT INTO Consultations (
            AppointmentID,
            HeartRate,
            RespiratoryRate,
            Temperature,
            BloodOxygen,
            SystolicBP,
            DiastolicBP,
            Weight,
            Height,
            ChiefComplaints,
            Diagnosis
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            appointmentID,
            heartRate,
            respiratoryRate,
            temperature,
            bloodOxygen,
            systolicBP,
            diastolicBP,
            weight,
            height,
            chiefComplaints,
            diagnosis
          ]
        );

        const insertId = result.insertId as number;

        const [rows] = await conn.execute<Consultation[]>(
          "SELECT * FROM Consultations WHERE ConsultationID = ?;",
          [insertId]
        );

        return res.status(201).json({
          data: rows[0]
        } as ConsultationResponse);
      }
      case "PUT": {
        const {
          consultationID,
          appointmentID,
          heartRate,
          respiratoryRate,
          temperature,
          bloodOxygen,
          systolicBP,
          diastolicBP,
          weight,
          height,
          chiefComplaints,
          diagnosis
        } = req.body;

        if (!consultationID) {
          return res.status(400).json({
            error: "consultationID is required"
          } as ConsultationResponse);
        }

        const [result]: any = await conn.execute(
          `UPDATE Consultations SET
            AppointmentID = ?,
            HeartRate = ?,
            RespiratoryRate = ?,
            Temperature = ?,
            BloodOxygen = ?,
            SystolicBP = ?,
            DiastolicBP = ?,
            Weight = ?,
            Height = ?,
            ChiefComplaints = ?,
            Diagnosis = ?
          WHERE ConsultationID = ?;`,
          [
            appointmentID,
            heartRate,
            respiratoryRate,
            temperature,
            bloodOxygen,
            systolicBP,
            diastolicBP,
            weight,
            height,
            chiefComplaints,
            diagnosis,
            consultationID
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Consultation not found"
          } as ConsultationResponse);
        }

        const [rows] = await conn.execute<Consultation[]>(
          "SELECT * FROM Consultations WHERE ConsultationID = ?;",
          [consultationID]
        );

        return res.status(200).json({
          data: rows[0]
        } as ConsultationResponse);
      }

      case "DELETE": {
        const { consultationID } = req.query;

        if (!consultationID) {
          return res.status(400).json({
            error: "consultationID is required"
          } as ConsultationResponse);
        }

        const [result]: any = await conn.execute(
          "DELETE FROM Consultations WHERE ConsultationID = ?;",
          [consultationID]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: "Consultation not found"
          } as ConsultationResponse);
        }

        return res.status(204).end();
      }

      default:
        return res.status(405).end();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal server error"
    } as ConsultationResponse);
  } finally {
    conn.release();
  }
}
