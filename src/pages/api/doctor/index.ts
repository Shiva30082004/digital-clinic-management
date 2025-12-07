import { CLINIC_ID_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Clinic from "@/types/Clinic";
import Doctor from "@/types/Doctor";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Doctor & Clinic>>
) {
  if (req.method === "GET") {
    const doctorId = req.headers[DOCTOR_ID_HEADER_KEY] as string;
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const doctorQuery =
      "SELECT doctorId, clinicId, firstName, lastName, role, emailAddress, specialization, consultationFees, clinicName, zipcode FROM Doctors NATURAL JOIN Clinics WHERE doctorId = ? AND clinicId = ?;";
    const doctorValues = [doctorId, clinicId];

    const [doctorRows] = await conn.execute<(Doctor & Clinic)[]>(
      doctorQuery,
      doctorValues
    );

    conn.release();

    return res.status(200).json({
      data: doctorRows?.[0] || {}
    });
  } else if (req.method === "PUT") {
    const doctorId = req.headers[DOCTOR_ID_HEADER_KEY] as string;
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;

    const {
      firstName = "",
      lastName = "",
      specialization = "",
      clinicName = "",
      zipcode = "",
      consultationFees = ""
    } = req.body || {};

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const doctorUpdateQuery =
      "UPDATE Doctors SET firstName = ?, lastName = ?, specialization = ?, consultationFees = ? WHERE doctorId = ?;";
    const doctorUpdateValues = [
      firstName,
      lastName,
      specialization,
      consultationFees,
      doctorId
    ];

    const clinicUpdateQuery =
      "UPDATE Clinics SET clinicName = ?, zipcode = ? WHERE clinicId = ?;";
    const clinicUpdateValues = [clinicName, zipcode, clinicId];

    await Promise.all([
      conn.execute<Clinic[]>(clinicUpdateQuery, clinicUpdateValues),
      conn.execute<Doctor[]>(doctorUpdateQuery, doctorUpdateValues)
    ]);

    const doctorQuery =
      "SELECT firstName, lastName, role, emailAddress, specialization, consultationFees FROM Doctors WHERE doctorId = ?;";
    const doctorValues = [doctorId];

    const clinicQuery = "SELECT clinicName FROM Clinics WHERE clinicId = ?;";
    const clinicValues = [clinicId];

    const [[doctorRows], [clinicRows]] = await Promise.all([
      conn.execute<Clinic[]>(clinicQuery, clinicValues),
      conn.execute<Doctor[]>(doctorQuery, doctorValues)
    ]);

    conn.release();

    return res.status(200).json({
      data: { ...(doctorRows?.[0] || {}), ...(clinicRows?.[0] || {}) }
    });
  } else {
    return res.status(405).end();
  }
}
