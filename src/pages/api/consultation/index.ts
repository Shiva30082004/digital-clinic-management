import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import { ROLE_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import ApiResponse from "@/types/ApiResponse";
import Consultation from "@/types/Consultation";

type ConsultationResponse = ApiResponse<Consultation | Consultation[]>;

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
  const consultationIDRaw = req.query.consultationID;
  const appointmentIDRaw = req.query.appointmentID;

  const consultationID = Array.isArray(consultationIDRaw)
    ? consultationIDRaw[0]
    : consultationIDRaw;
  const appointmentID = Array.isArray(appointmentIDRaw)
    ? appointmentIDRaw[0]
    : appointmentIDRaw;

  const role = req.headers[ROLE_HEADER_KEY] as string;
  const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
    let query = "";
    let params: any[] = [];

    if (consultationID) {
      if (role === "ADMIN_DOCTOR" || role === "CONSULTANT") {
        query = `
          SELECT c.*
          FROM Consultations c
          JOIN Appointments a ON c.AppointmentID = a.AppointmentID
          WHERE c.ConsultationID = ? AND a.DoctorID = ?;
        `;
        params = [consultationID, doctorID];
      } else {
        query = "SELECT * FROM Consultations WHERE ConsultationID = ?;";
        params = [consultationID];
      }

      const [rows] = await conn.execute<Consultation[]>(query, params);

      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Consultation not found" } as ConsultationResponse);
      }

      return res.status(200).json({ data: rows[0] } as ConsultationResponse);
    }

    if (role === "ADMIN_DOCTOR") {
      if (appointmentID) {
        query = `
          SELECT c.*
          FROM Consultations c
          JOIN Appointments a ON c.AppointmentID = a.AppointmentID
          WHERE c.AppointmentID = ?;
        `;
        params = [appointmentID];
      } else {
        query = `
          SELECT c.*
          FROM Consultations c
          JOIN Appointments a ON c.AppointmentID = a.AppointmentID;
        `;
        params = [];
      }
    } else if (role === "CONSULTANT") {
      if (appointmentID) {
        query = `
          SELECT c.*
          FROM Consultations c
          JOIN Appointments a ON c.AppointmentID = a.AppointmentID
          WHERE c.AppointmentID = ? AND a.DoctorID = ?;
        `;
        params = [appointmentID, doctorID];
      } else {
        query = `
          SELECT c.*
          FROM Consultations c
          JOIN Appointments a ON c.AppointmentID = a.AppointmentID
          WHERE a.DoctorID = ?;
        `;
        params = [doctorID];
      }
    } else {
      query = `
        SELECT c.*
        FROM Consultations c
        JOIN Appointments a ON c.AppointmentID = a.AppointmentID;
      `;
      params = [];
    }

    const [rows] = await conn.execute<Consultation[]>(query, params);

    return res.status(200).json({
      data: rows
    } as ConsultationResponse);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as ConsultationResponse);
  } finally {
    conn.release();
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
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

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as ConsultationResponse);
  } finally {
    conn.release();
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
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

  const role = req.headers[ROLE_HEADER_KEY] as string;
  const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
    const [apptRows]: any = await conn.execute(
      "SELECT AppointmentStatus, DoctorID FROM Appointments WHERE AppointmentID = ?;",
      [appointmentID]
    );

    if (!apptRows || apptRows.length === 0) {
      return res.status(400).json({
        error: "Appointment not found for this consultation"
      } as ConsultationResponse);
    }

    const apptStatus = apptRows[0].AppointmentStatus as string;
    const apptDoctorID = String(apptRows[0].DoctorID);

    if (apptStatus === "COM") {
       return res.status(400).json({
         error: "Consultation cannot be edited for completed appointments"
       } as ConsultationResponse);
     }

    if (
      (role === "ADMIN_DOCTOR" || role === "CONSULTANT") &&
      apptDoctorID !== doctorID
    ) {
      return res.status(403).json({
        error: "Not allowed to modify another doctor's consultation"
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as ConsultationResponse);
  } finally {
    conn.release();
  }
}


async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
  const consultationIDRaw = req.query.consultationID;
  const consultationID = Array.isArray(consultationIDRaw)
    ? consultationIDRaw[0]
    : consultationIDRaw;

  if (!consultationID) {
    return res.status(400).json({
      error: "consultationID is required"
    } as ConsultationResponse);
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
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
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as ConsultationResponse);
  } finally {
    conn.release();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).end();
  }
}
