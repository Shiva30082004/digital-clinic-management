import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import { RowDataPacket } from "mysql2";
import {
  CLINIC_ID_HEADER_KEY,
  DOCTOR_ID_HEADER_KEY,
  ROLE_HEADER_KEY
} from "@/constants/auth";

interface RevenueData extends RowDataPacket {
  accountYear: number;
  accountMonth: number;
  totalRevenue: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ error: "Database connection failed" });
  }

  try {
    // Get clinic ID and role from headers or query params
    const clinicID =
      (req.headers[CLINIC_ID_HEADER_KEY] as string) ||
      (req.query.clinicId as string);
    const role =
      (req.headers[ROLE_HEADER_KEY] as string) || (req.query.role as string);

    // Only admins can access revenue analytics
    if (role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    if (!clinicID) {
      return res.status(400).json({ error: "Clinic ID is required" });
    }

    // Get revenue for entire clinic
    const query = `
      SELECT 
        YEAR(a.EndTime) AS accountYear, 
        MONTH(a.EndTime) AS accountMonth,
        SUM(i.Amount) AS totalRevenue
      FROM Appointments a
      NATURAL JOIN Invoices i
      NATURAL JOIN Doctors d
      WHERE a.AppointmentStatus = 'COM' AND d.ClinicID = ?
      GROUP BY accountYear, accountMonth
      ORDER BY accountYear DESC, accountMonth DESC
      LIMIT 6
    `;
    const values = [clinicID];

    const [rows] = await conn.execute<RevenueData[]>(query, values);

    return res.status(200).json({
      data: rows,
      error: `Found revenue data for ${rows.length} months`
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return res.status(500).json({ error: "Failed to fetch revenue data" });
  } finally {
    conn.release();
  }
}
