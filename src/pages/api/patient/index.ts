import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Patient from "@/types/Patient";
import { CLINIC_ID_HEADER_KEY } from "@/constants/auth";


const ALLOWED_GENDERS = ["M", "F"] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Patient | Patient[]>>
) {
  const method = req.method?.toUpperCase();

  if (!["GET", "POST", "PUT", "DELETE"].includes(method || "")) {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Middleware guarantees this exists
  const clinicId = Number(req.headers[CLINIC_ID_HEADER_KEY]);

  //
  // ------------------------ GET ------------------------
  //
  if (method === "GET") {
    const idParam = req.query.id;
    const patientId = Array.isArray(idParam) ? Number(idParam[0]) : Number(idParam);

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      if (patientId) {
        const sql = `
          SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
                 TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
                 clinicId
          FROM Patients
          WHERE patientId = ? AND clinicId = ?
        `;
        const [rows] = await conn.execute<Patient[]>(sql, [patientId, clinicId]);
        conn.release();

        if (rows.length === 0) {
          return res.status(404).json({ message: "Patient not found" });
        }

        return res.status(200).json({ data: rows[0] });
      }

      // Otherwise: list all
      const sql = `
        SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
               TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
               clinicId
        FROM Patients
        WHERE clinicId = ?
        ORDER BY firstName, lastName
      `;
      const [rows] = await conn.execute<Patient[]>(sql, [clinicId]);
      conn.release();

      return res.status(200).json({ data: rows });
    } catch (err) {
      console.error("GET patients error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //
  // ------------------------ POST ------------------------
  //
  if (method === "POST") {
    const { firstName, lastName, emailAddress, gender, dateOfBirth } = req.body ?? {};

    // Validate before DB call
    if (!firstName) return res.status(400).json({ message: "firstName is required" });
    if (!ALLOWED_GENDERS.includes(gender)) {
      return res.status(400).json({ message: "gender must be 'M' or 'F'" });
    }
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid dateOfBirth (YYYY-MM-DD)" });
      }
    }

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const sql = `
        INSERT INTO Patients (firstName, lastName, emailAddress, gender, dateOfBirth, clinicId)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        firstName,
        lastName ?? null,
        emailAddress ?? null,
        gender,
        dateOfBirth ?? null,
        clinicId
      ];

      const [result]: any = await conn.execute(sql, values);
      const insertedId = result.insertId;

      // Fetch the created record
      const [rows] = await conn.execute<Patient[]>(
        `
          SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
                 TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
                 clinicId
          FROM Patients
          WHERE patientId = ? AND clinicId = ?
        `,
        [insertedId, clinicId]
      );

      conn.release();

      return res.status(201).json({
        data: rows[0],
        message: "Patient created"
      });
    } catch (err) {
      console.error("POST patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //
  // ------------------------ PUT ------------------------
  //
  if (method === "PUT") {
    const { patientId, firstName, lastName, emailAddress, gender, dateOfBirth } = req.body ?? {};

    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (firstName !== undefined) {
      updates.push("firstName = ?");
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push("lastName = ?");
      values.push(lastName ?? null);
    }
    if (emailAddress !== undefined) {
      updates.push("emailAddress = ?");
      values.push(emailAddress ?? null);
    }
    if (gender !== undefined) {
      if (!ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({ message: "gender must be 'M' or 'F'" });
      }
      updates.push("gender = ?");
      values.push(gender);
    }
    if (dateOfBirth !== undefined) {
      if (dateOfBirth !== null) {
        const d = new Date(dateOfBirth);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ message: "Invalid dateOfBirth (YYYY-MM-DD)" });
        }
      }
      updates.push("dateOfBirth = ?");
      values.push(dateOfBirth ?? null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add WHERE clause params
    values.push(patientId, clinicId);

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const sql = `
        UPDATE Patients
        SET ${updates.join(", ")}
        WHERE patientId = ? AND clinicId = ?
      `;
      const [result]: any = await conn.execute(sql, values);

      if (result.affectedRows === 0) {
        conn.release();
        return res.status(404).json({ message: "Patient not found" });
      }

      // Fetch updated record
      const [rows] = await conn.execute<Patient[]>(
        `
          SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
                 TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
                 clinicId
          FROM Patients
          WHERE patientId = ? AND clinicId = ?
        `,
        [patientId, clinicId]
      );

      conn.release();

      return res.status(200).json({
        data: rows[0],
        message: "Patient updated"
      });
    } catch (err) {
      console.error("PUT patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  //
  // ------------------------ DELETE ------------------------
  //
  if (method === "DELETE") {
    const idParam = req.query.id;
    const patientId = Array.isArray(idParam) ? Number(idParam[0]) : Number(idParam);

    if (!patientId) {
      return res.status(400).json({ message: "patient id is required" });
    }

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const sql = `
        DELETE FROM Patients
        WHERE patientId = ? AND clinicId = ?
      `;
      const [result]: any = await conn.execute(sql, [patientId, clinicId]);

      conn.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      return res.status(200).json({ message: "Patient deleted" });
    } catch (err) {
      console.error("DELETE patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
