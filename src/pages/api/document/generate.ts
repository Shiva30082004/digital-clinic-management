import {
  CLINIC_ID_HEADER_KEY,
  DOCTOR_ID_HEADER_KEY,
  ROLE_HEADER_KEY
} from "@/constants/auth";
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
    const role = req.headers[ROLE_HEADER_KEY] as string;
    const { appointmentId = "" } = req.query;

    if (!appointmentId) {
      return res.status(400).json({
        error: "AppointmentID is required"
      });
    }

    const conn = await getDbConnection();

    if (!conn) return res.status(500).end();

    let appointmentQuery = "";
    let appointmentValues: any[] = [];

    if (role === "admin") {
      appointmentQuery =
        "SELECT a.startTime AS date, a.patientId AS patientId, CONCAT(d.firstName, ' ', d.lastName) AS doctor_name, d.emailAddress AS doctor_email, specialization, consultationFees, clinicName AS clinic_name, zipcode AS clinic_address, CONCAT(p.firstName, ' ', p.lastName) AS patient_name, TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS patient_age, gender AS patient_gender FROM Appointments a NATURAL JOIN Doctors d NATURAL JOIN Clinics c JOIN Patients p ON p.PatientID = a.PatientID WHERE appointmentId = ? AND c.clinicId = ?";
      appointmentValues = [appointmentId, clinicId];
    } else {
      appointmentQuery =
        "SELECT a.startTime AS date, a.patientId AS patientId, CONCAT(d.firstName, ' ', d.lastName) AS doctor_name, d.emailAddress AS doctor_email, specialization, consultationFees, clinicName AS clinic_name, zipcode AS clinic_address, CONCAT(p.firstName, ' ', p.lastName) AS patient_name, TIMESTAMPDIFF(YEAR, dateOfBirth, CURDATE()) AS patient_age, gender AS patient_gender FROM Appointments a NATURAL JOIN Doctors d NATURAL JOIN Clinics c JOIN Patients p ON p.PatientID = a.PatientID WHERE appointmentId = ? AND doctorId = ? AND c.clinicId = ?";
      appointmentValues = [appointmentId, doctorId, clinicId];
    }

    const [appointments] = await conn.execute<
      (Appointment & Doctor & Patient & Clinic)[]
    >(appointmentQuery, appointmentValues);

    if (appointments.length === 0) {
      conn.release();
      return res.status(404).json({ error: "Appointment not found" });
    }

    const [
      {
        date = "",
        patientId = "",
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
      "SELECT * FROM Consultations LEFT OUTER JOIN Invoices ON Consultations.AppointmentID = Invoices.AppointmentID WHERE Consultations.AppointmentID = ?";
    const consultationValues = [appointmentId];

    const [
      [
        {
          ConsultationID: consultationId = "",
          HeartRate = "",
          RespiratoryRate = "",
          Temperature = "",
          BloodOxygen = "",
          SystolicBP = "",
          DiastolicBP = "",
          Weight = "",
          Height = "",
          ChiefComplaints: chief_complaints = "",
          Diagnosis: diagnosis = "",
          Amount: invoice_total = 0
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

    const data = {
      doctor_name: `Dr. ${doctor_name}`,
      doctor_email,
      specialization,
      clinic_name,
      clinic_address,
      patient_name,
      patient_age,
      patient_gender,
      chief_complaints: chief_complaints || "None",
      diagnosis: diagnosis || "None",
      patient_id: `P${patientId}`,
      date: new Date(date).toLocaleString(),
      temperature: Temperature ? `${Temperature} F` : "NA",
      weight: Weight ? `${Weight}kg` : "NA",
      height: Height ? `${Height}cm` : "NA",
      bp: SystolicBP && DiastolicBP ? `${SystolicBP}/${DiastolicBP}` : "NA",
      spo2: BloodOxygen ? `${BloodOxygen}` : "NA",
      heart_rate: HeartRate ? `${HeartRate}bpm` : "NA",
      respiratory_rate: RespiratoryRate ? `${RespiratoryRate}` : "NA",
      procedures:
        procedureRows.length > 0
          ? procedureRows
              .map((procedure) => procedure.ProcedureName || "")
              .join(", ")
          : "None",
      invoice_items: `
        <tr><td>Consultation Fees</td><td>$${consultationFees}</td></tr>
        ${procedureRows
          .map(
            (procedure) =>
              `<tr><td>${procedure.ProcedureName || ""}</td><td>$${
                procedure.Amount || 0
              }</td></tr>`
          )
          .join("\n")}
        ${`<tr>
            <td><strong>Total</strong></td>
            <td><strong>${
              invoice_total ? `${invoice_total}` : "Final invoice not generated"
            }</strong></td>
          </tr>`}
    `,
      generated_by: "DigiClinic",
      generated_at: new Date().toLocaleString()
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
      data: Buffer.from(pdfBuffer).toString("base64") || ""
    });
  } else {
    return res.status(405).end();
  }
}
