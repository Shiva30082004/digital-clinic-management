import { CLINIC_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Patient from "@/types/Patient";
import type { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_GENDERS = ["M", "F"] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Patient | Patient[]>>
) {
  //
  // ------------------------ GET ------------------------
  //
  if (req.method === "GET") {
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
    const idParam = req.query.id;
    const patientId = Array.isArray(idParam) ? idParam[0] : idParam;

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      if (patientId) {
        // Single patient
        const query = `
          SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
                 TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
                 clinicId
          FROM Patients
          WHERE patientId = ? AND clinicId = ?
        `;
        const values = [patientId, clinicId];
        const [rows] = await conn.execute<Patient[]>(query, values);
        conn.release();

        if (rows.length === 0) {
          return res.status(404).json({ error: "Patient not found" });
        }

        return res.status(200).json({ data: rows[0] });
      }

      // List all patients
      const query = `
        SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
               TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
               clinicId
        FROM Patients
        WHERE clinicId = ?
        ORDER BY firstName, lastName
      `;
      const values = [clinicId];
      const [rows] = await conn.execute<Patient[]>(query, values);
      conn.release();

      return res.status(200).json({ data: rows });
    } catch (err) {
      console.error("GET patients error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  //
  // ------------------------ POST ------------------------
  //
  if (req.method === "POST") {
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
    const { firstName, lastName, emailAddress, gender, dateOfBirth } = req.body ?? {};

    // Validate required fields
    if (!firstName) {
      return res.status(400).json({ error: "firstName is required" });
    }
    if (!gender || !ALLOWED_GENDERS.includes(gender)) {
      return res.status(400).json({ error: "gender is required and must be 'M' or 'F'" });
    }
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ error: "Invalid dateOfBirth format (use YYYY-MM-DD)" });
      }
    }

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const query = `
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

      const [result]: any = await conn.execute(query, values);
      const insertedId = result.insertId;

      // Fetch the created record
      const fetchQuery = `
        SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
               TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
               clinicId
        FROM Patients
        WHERE patientId = ? AND clinicId = ?
      `;
      const [rows] = await conn.execute<Patient[]>(fetchQuery, [insertedId, clinicId]);
      conn.release();

      return res.status(201).json({
        data: rows[0],
        error: "Patient created"
      });
    } catch (err) {
      console.error("POST patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  //
  // ------------------------ PUT ------------------------
  //
  if (req.method === "PUT") {
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
    const { patientId, firstName, lastName, emailAddress, gender, dateOfBirth } = req.body ?? {};

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
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
        return res.status(400).json({ error: "gender must be 'M' or 'F'" });
      }
      updates.push("gender = ?");
      values.push(gender);
    }
    if (dateOfBirth !== undefined) {
      if (dateOfBirth !== null) {
        const d = new Date(dateOfBirth);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ error: "Invalid dateOfBirth format (use YYYY-MM-DD)" });
        }
      }
      updates.push("dateOfBirth = ?");
      values.push(dateOfBirth ?? null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(patientId, clinicId);

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const query = `
        UPDATE Patients
        SET ${updates.join(", ")}
        WHERE patientId = ? AND clinicId = ?
      `;
      const [result]: any = await conn.execute(query, values);

      if (result.affectedRows === 0) {
        conn.release();
        return res.status(404).json({ error: "Patient not found" });
      }

      // Fetch updated record
      const fetchQuery = `
        SELECT patientId, firstName, lastName, emailAddress, gender, dateOfBirth,
               TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS age,
               clinicId
        FROM Patients
        WHERE patientId = ? AND clinicId = ?
      `;
      const [rows] = await conn.execute<Patient[]>(fetchQuery, [patientId, clinicId]);
      conn.release();

      return res.status(200).json({
        data: rows[0],
        error: "Patient updated"
      });
    } catch (err) {
      console.error("PUT patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  //
  // ------------------------ DELETE ------------------------
  //
  if (req.method === "DELETE") {
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
    const idParam = req.query.id;
    const patientId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!patientId) {
      return res.status(400).json({ error: "patient id is required" });
    }

    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const query = `
        DELETE FROM Patients
        WHERE patientId = ? AND clinicId = ?
      `;
      const values = [patientId, clinicId];
      const [result]: any = await conn.execute(query, values);
      conn.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }

      return res.status(200).json({ error: "Patient deleted" });
    } catch (err) {
      console.error("DELETE patient error:", err);
      try { conn.release(); } catch {}
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Method not allowed
  return res.status(405).end();
}