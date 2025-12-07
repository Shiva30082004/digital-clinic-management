import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import { ROLE_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import ApiResponse from "@/types/ApiResponse";
import Invoice from "@/types/Invoice";

type InvoiceResponse = ApiResponse<Invoice | Invoice[]>;

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const invoiceIDRaw = req.query.invoiceID;
  const invoiceID = Array.isArray(invoiceIDRaw) ? invoiceIDRaw[0] : invoiceIDRaw;

  const role = req.headers[ROLE_HEADER_KEY] as string;
  const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;

  const conn = await getDbConnection();
  if (!conn) {
    return res
      .status(500)
      .json({ error: "Database connection failed" } as InvoiceResponse);
  }

  try {
    let query = "";
    let params: any[] = [];

    if (invoiceID) {
      if (role === "ADMIN_DOCTOR" || role === "CONSULTANT") {
        query = `
          SELECT i.*
          FROM Invoices i
          JOIN Appointments a ON i.AppointmentID = a.AppointmentID
          WHERE i.InvoiceID = ? AND a.DoctorID = ?;
        `;
        params = [invoiceID, doctorID];
      } else {
        query = "SELECT * FROM Invoices WHERE InvoiceID = ?;";
        params = [invoiceID];
      }

      const [rows] = await conn.execute<Invoice[]>(query, params);

      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Invoice not found" } as InvoiceResponse);
      }

      return res.status(200).json({ data: rows[0] } as InvoiceResponse);
    }

    if (role === "ADMIN_DOCTOR") {
      query = `
        SELECT i.*
        FROM Invoices i
        JOIN Appointments a ON i.AppointmentID = a.AppointmentID;
      `;
      params = [];
    } else if (role === "CONSULTANT") {
      query = `
        SELECT i.*
        FROM Invoices i
        JOIN Appointments a ON i.AppointmentID = a.AppointmentID
        WHERE a.DoctorID = ?;
      `;
      params = [doctorID];
    } else {
      query = `
        SELECT i.*
        FROM Invoices i
        JOIN Appointments a ON i.AppointmentID = a.AppointmentID;
      `;
      params = [];
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
  const invoiceID = Array.isArray(invoiceIDRaw) ? invoiceIDRaw[0] : invoiceIDRaw;

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
