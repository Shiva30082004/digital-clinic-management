import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import {
  ROLE_HEADER_KEY,
  DOCTOR_ID_HEADER_KEY,
  CLINIC_ID_HEADER_KEY
} from "@/constants/auth";
import ApiResponse from "@/types/ApiResponse";
import Consultation from "@/types/Consultation";

type ConsultationResponse = ApiResponse<Consultation | Consultation[] | null>;
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ConsultationResponse>
) {
  const appointmentIDRaw = req.query.appointmentID;
  const appointmentID = Array.isArray(appointmentIDRaw)
    ? appointmentIDRaw[0]
    : appointmentIDRaw;

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

    if (appointmentID) {
      query = `
          SELECT *
          FROM Consultations
          NATURAL JOIN Appointments
          NATURAL JOIN Doctors
          JOIN Patients ON Appointments.PatientID = Patients.patientId
          WHERE AppointmentID = ? AND DoctorID = ?;
        `;
      params = [appointmentID, doctorID];

      const [rows] = await conn.execute<Consultation[]>(query, params);

      if (!rows || rows.length === 0) {
        return res.status(200).json({ data: null } as ConsultationResponse);
      }

      return res.status(200).json({ data: rows[0] } as ConsultationResponse);
    } else {
      return res
        .status(400)
        .json({ error: "appointmentID is required" } as ConsultationResponse);
    }
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
    return res
      .status(400)
      .json({ error: "appointmentID is required" } as ConsultationResponse);
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

    return res.status(201).json({ data: rows[0] } as ConsultationResponse);
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
    return res
      .status(400)
      .json({ error: "appointmentID is required" } as ConsultationResponse);
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

    if (apptDoctorID !== doctorID) {
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
      WHERE AppointmentID = ?;`,
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
        appointmentID
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Consultation not found" } as ConsultationResponse);
    }

    const [rows] = await conn.execute<Consultation[]>(
      "SELECT * FROM Consultations WHERE AppointmentID = ?;",
      [appointmentID]
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
  const appointmentIDRaw = req.query.appointmentID;
  const appointmentID = Array.isArray(appointmentIDRaw)
    ? appointmentIDRaw[0]
    : appointmentIDRaw;

  if (!appointmentID) {
    return res
      .status(400)
      .json({ error: "appointmentID is required" } as ConsultationResponse);
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as ConsultationResponse);
  }

  try {
    const [result]: any = await conn.execute(
      "DELETE FROM Consultations WHERE AppointmentID = ?;",
      [appointmentID]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Consultation not found" } as ConsultationResponse);
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
