import { CLINIC_ID_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import puppeteer from "puppeteer";
import ApiResponse from "@/types/ApiResponse";
import Document from "@/types/Document";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { getDbConnection } from "@/lib/database";
import Appointment from "@/types/Appointment";
import Procedure from "@/types/Procedure";
import Consultation from "@/types/Consultation";
import Invoice from "@/types/Invoice";
import Doctor from "@/types/Doctor";
import Patient from "@/types/Patient";
import Clinic from "@/types/Clinic";

const baseTemplate = fs.readFileSync(
  "./src/templates/prescription.html",
  "utf8"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Document>>
) {
  if (req.method === "GET") {
    const doctorId = req.headers[DOCTOR_ID_HEADER_KEY] as string;
    const clinicId = req.headers[CLINIC_ID_HEADER_KEY] as string;
    const { appointmentId = "" } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        error: "AppointmentID is required"
      });
    }

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    const appointmentQuery =
      "SELECT CONCAT(d.firstName, ' ', d.lastName) AS doctor_name, d.emailAddress AS doctor_email, specialization, consultationFees, clinicName AS clinic_name, zipcode AS clinic_address, CONCAT(p.firstName, ' ', p.lastName) AS patient_name, TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS patient_age, gender AS patient_gender FROM Appointments NATURAL JOIN Doctors d NATURAL JOIN Patients p NATURAL JOIN Clinics WHERE appointmentId = ? AND doctorId = ? AND clinicId = ?";
    const appointmentValues = [appointmentId, doctorId, clinicId];

    const [appointments] = await conn.execute<
      (Appointment & Doctor & Patient & Clinic)[]
    >(appointmentQuery, appointmentValues);

    if (appointments.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Appointment not found" });
    }

    const [
      {
        doctor_name = "",
        doctor_email = "",
        specialization = "",
        consultationFees = 0,
        clinic_name = "",
        clinic_address = "",
        patient_name = "",
        patient_age = "",
        patient_gender = ""
      } = {}
    ] = appointments || [];

    const consultationQuery =
      "SELECT * FROM Consultations NATURAL JOIN Invoices WHERE appointmentId = ?";
    const consultationValues = [appointmentId];

    const [
      [
        {
          consultationID: consultationId = "",
          heartRate = "",
          respiratoryRate = "",
          temperature = "",
          bloodOxygen = "",
          systolicBP = "",
          diastolicBP = "",
          weight = "",
          height = "",
          chiefComplaints: chief_complaints = "",
          diagnosis = "",
          amount: invoice_total = 0
        } = {}
      ]
    ] = await conn.execute<(Consultation & Invoice)[]>(
      consultationQuery,
      consultationValues
    );

    const proceduresQuery =
      "SELECT * FROM ConsultationProcedures NATURAL JOIN Procedures WHERE consultationId = ?";
    const proceduresValues = [consultationId];

    const [procedureRows = []] = await conn.execute<Procedure[]>(
      proceduresQuery,
      proceduresValues
    );

    const vitals = [];

    if (temperature) vitals.push(`Temperature: ${temperature} C`);
    if (weight) vitals.push(`Weight: ${weight}kg`);
    if (height) vitals.push(`Height: ${height}cm`);
    if (systolicBP && diastolicBP)
      vitals.push(`BP: ${systolicBP}/${diastolicBP}`);
    if (bloodOxygen) vitals.push(`SpO2: ${bloodOxygen}`);
    if (heartRate) vitals.push(`Heart Rate: ${heartRate}bpm`);
    if (respiratoryRate) vitals.push(`Respiratory Rate: ${respiratoryRate}`);

    const data = {
      doctor_name,
      doctor_email,
      specialization,
      clinic_name,
      clinic_address,
      patient_name,
      patient_age,
      patient_gender,
      chief_complaints,
      diagnosis,
      vitals: vitals.join(", "),
      procedures: procedureRows
        .map((procedure) => procedure.procedureName || "")
        .join(", "),
      invoice_items: `
        <tr><td>Consultation Fees</td><td>${consultationFees}</td></tr>
        ${procedureRows
          .map(
            (procedure) =>
              `<tr><td>${procedure.procedureName || ""}</td><td>${
                procedure.amount || 0
              }</td></tr>`
          )
          .join("\n")}
    `,
      invoice_total
    };

    let template = baseTemplate;
    Object.entries(data).forEach(([key, value]) => {
      template = template.replaceAll(`{{${key}}}`, value);
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });
    const page = await browser.newPage();

    await page.setContent(template, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px"
      }
    });

    await browser.close();

    return res.status(200).json({
      data: `data:application/pdf;base64,${
        Buffer.from(pdfBuffer).toString("base64") || ""
      }`
    });
  } else {
    return res.status(405).end();
  }
}
