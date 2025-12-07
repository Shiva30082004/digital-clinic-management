import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import {
  ROLE_HEADER_KEY,
  DOCTOR_ID_HEADER_KEY,
  CLINIC_ID_HEADER_KEY
} from "@/constants/auth";
import ApiResponse from "@/types/ApiResponse";
import Invoice from "@/types/Invoice";

type InvoiceResponse = ApiResponse<Invoice | Invoice[]>;

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const role = req.headers[ROLE_HEADER_KEY] as string;
  const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;
  const clinicID = req.headers[CLINIC_ID_HEADER_KEY] as string;

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as InvoiceResponse);
  }

  try {
    let query = "";
    let params: any[] = [];

    const patientId = req.query.patientId as string | undefined;

    if (patientId) {
      if (role === "admin") {
        query = `SELECT * FROM Invoices NATURAL JOIN Appointments NATURAL JOIN Doctors WHERE patientId = ? AND clinicID = ? ORDER BY invoiceId DESC;`;
        params = [patientId, clinicID];
      } else {
        query = `SELECT * FROM Invoices NATURAL JOIN Appointments WHERE patientId = ? AND doctorID = ? ORDER BY invoiceId DESC;`;
        params = [patientId, doctorID];
      }
    } else {
      if (role === "admin") {
        query = `SELECT * FROM Invoices NATURAL JOIN Appointments NATURAL JOIN Doctors WHERE clinicID = ? ORDER BY invoiceId DESC;`;
        params = [clinicID];
      } else {
        query = `SELECT * FROM Invoices NATURAL JOIN Appointments WHERE doctorID = ? ORDER BY invoiceId DESC;`;
        params = [doctorID];
      }
    }

    const [rows] = await conn.execute<Invoice[]>(query, params);

    return res.status(200).json({
      data: rows
    } as InvoiceResponse);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as InvoiceResponse);
  } finally {
    conn.release();
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const { amount, appointmentID } = req.body;

  if (amount == null || appointmentID == null) {
    return res.status(400).json({
      error: "amount and appointmentID are required"
    } as InvoiceResponse);
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as InvoiceResponse);
  }

  try {
    const [result]: any = await conn.execute(
      "INSERT INTO Invoices (Amount, AppointmentID) VALUES (?, ?);",
      [amount, appointmentID]
    );

    const insertId = result.insertId as number;

    const [rows] = await conn.execute<Invoice[]>(
      "SELECT * FROM Invoices WHERE InvoiceID = ?;",
      [insertId]
    );

    return res.status(201).json({
      data: rows[0]
    } as InvoiceResponse);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as InvoiceResponse);
  } finally {
    conn.release();
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const { invoiceID, amount, appointmentID } = req.body;

  if (invoiceID == null) {
    return res.status(400).json({
      error: "invoiceID is required"
    } as InvoiceResponse);
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as InvoiceResponse);
  }

  try {
    const [result]: any = await conn.execute(
      "UPDATE Invoices SET Amount = ?, AppointmentID = ? WHERE InvoiceID = ?;",
      [amount, appointmentID, invoiceID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Invoice not found"
      } as InvoiceResponse);
    }

    const [rows] = await conn.execute<Invoice[]>(
      "SELECT * FROM Invoices WHERE InvoiceID = ?;",
      [invoiceID]
    );

    return res.status(200).json({
      data: rows[0]
    } as InvoiceResponse);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as InvoiceResponse);
  } finally {
    conn.release();
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const invoiceIDRaw = req.query.invoiceID;
  const invoiceID = Array.isArray(invoiceIDRaw)
    ? invoiceIDRaw[0]
    : invoiceIDRaw;

  if (!invoiceID) {
    return res.status(400).json({
      error: "invoiceID is required"
    } as InvoiceResponse);
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as InvoiceResponse);
  }

  try {
    const [result]: any = await conn.execute(
      "DELETE FROM Invoices WHERE InvoiceID = ?;",
      [invoiceID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Invoice not found"
      } as InvoiceResponse);
    }

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal server error" } as InvoiceResponse);
  } finally {
    conn.release();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
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
