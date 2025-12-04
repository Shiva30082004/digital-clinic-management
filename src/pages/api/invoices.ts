// pages/api/invoices.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Invoice from "@/types/Invoice";

type InvoiceResponse = ApiResponse<Invoice | Invoice[]>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InvoiceResponse>
) {
  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ message: "Database connection failed" } as InvoiceResponse);
  }

  try {
    switch (req.method) {
      case "GET": {
        const { invoiceID, appointmentID } = req.query;

        let query = "SELECT * FROM Invoices";
        const conditions: string[] = [];
        const params: any[] = [];

        if (invoiceID) {
          conditions.push("InvoiceID = ?");
          params.push(invoiceID);
        }
        if (appointmentID) {
          conditions.push("AppointmentID = ?");
          params.push(appointmentID);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }

        const [rows] = await conn.execute<Invoice[]>(query, params);

        return res.status(200).json({
          data: invoiceID ? rows[0] : rows
        } as InvoiceResponse);
      }
      case "POST": {
        const { amount, appointmentID } = req.body;

        if (amount == null || appointmentID == null) {
          return res.status(400).json({
            message: "amount and appointmentID are required"
          } as InvoiceResponse);
        }

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
      }
      case "PUT": {
        const { invoiceID, amount, appointmentID } = req.body;

        if (!invoiceID) {
          return res.status(400).json({
            message: "invoiceID is required"
          } as InvoiceResponse);
        }
        const [result]: any = await conn.execute(
          "UPDATE Invoices SET Amount = ?, AppointmentID = ? WHERE InvoiceID = ?;",
          [amount, appointmentID, invoiceID]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Invoice not found"
          } as InvoiceResponse);
        }

        const [rows] = await conn.execute<Invoice[]>(
          "SELECT * FROM Invoices WHERE InvoiceID = ?;",
          [invoiceID]
        );

        return res.status(200).json({
          data: rows[0]
        } as InvoiceResponse);
      }

      case "DELETE": {
        const { invoiceID } = req.query;

        if (!invoiceID) {
          return res.status(400).json({
            message: "invoiceID is required"
          } as InvoiceResponse);
        }

        const [result]: any = await conn.execute(
          "DELETE FROM Invoices WHERE InvoiceID = ?;",
          [invoiceID]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Invoice not found"
          } as InvoiceResponse);
        }
        return res.status(204).end();
      }

      default:
        return res.status(405).end();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error"
    } as InvoiceResponse);
  } finally {
    conn.release();
  }
}
