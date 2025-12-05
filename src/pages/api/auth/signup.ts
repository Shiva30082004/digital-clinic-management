import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Doctor from "@/types/Doctor";
import { ResultSetHeader } from "mysql2";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Doctor>>
) {
  if (req.method === "POST") {
    const {
      firstName = "",
      lastName = "",
      emailAddress = "",
      role = "consultant",
      specialization = "",
      clinicName = "",
      clinicId = "",
      zipcode = "",
      consultationFees = 0
    } = req.body || {};

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    let _clinicId = 0;

    if (role === "admin") {
      if (!clinicName || !zipcode) {
        return res
          .status(400)
          .json({ error: "Clinic name and zipcode is required" });
      }

      const createClinicQuery =
        "INSERT INTO Clinics(ClinicName, Zipcode) VALUES (?, ?)";
      const createClinicValues = [clinicName, zipcode];

      const [{ insertId: newClinicId = 0 } = {}] =
        await conn.execute<ResultSetHeader>(
          createClinicQuery,
          createClinicValues
        );
      _clinicId = newClinicId;
    } else {
      if (!clinicId) {
        return res.status(400).json({ error: "ClinicID is required" });
      }
      _clinicId = clinicId;
    }

    const createDoctorQuery =
      "INSERT INTO Doctors(FirstName, LastName, EmailAddress, Specialization, ConsultationFees, Role, ClinicID) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const createDoctorValues = [
      firstName,
      lastName,
      emailAddress,
      specialization,
      consultationFees,
      role,
      _clinicId
    ];

    const [{ insertId: newDoctorId = 0 } = {}] =
      await conn.execute<ResultSetHeader>(
        createDoctorQuery,
        createDoctorValues
      );

    const query = "SELECT * FROM Doctors WHERE doctorId = ?;";
    const values = [newDoctorId];

    const [rows] = await conn.execute<Doctor[]>(query, values);

    conn.release();

    return res.status(201).json({
      data: rows[0] || {}
    });
  } else {
    return res.status(405).end();
  }
}
