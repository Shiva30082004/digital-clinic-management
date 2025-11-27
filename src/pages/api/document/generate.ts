import { CLINIC_ID_HEADER_KEY, DOCTOR_ID_HEADER_KEY } from "@/constants/auth";
import puppeteer from "puppeteer";
import ApiResponse from "@/types/ApiResponse";
import Document from "@/types/Document";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

const baseTemplate = fs.readFileSync(
  "./src/templates/prescription.html",
  "utf8"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Document>>
) {
  if (req.method === "GET") {
    const doctorID = req.headers[DOCTOR_ID_HEADER_KEY] as string;
    const clinicID = req.headers[CLINIC_ID_HEADER_KEY] as string;
    // const { appointmentID = "" } = req.body;

    // if (!appointmentID) {
    //   return res.status(400).json({
    //     message: "AppointmentID is required"
    //   });
    // }

    const data = {
      doctor_name: "Dr. John Doe",
      doctor_email: "john.doe@clinic.com",
      specialization: "Cardiologist",
      clinic_name: "HealthCare Clinic",
      clinic_address: "123 Main Street, NY",

      patient_name: "Ramesh Kumar",
      patient_age: "42",
      patient_gender: "Male",

      chief_complaints: "Chest pain, shortness of breath.",
      diagnosis: "Suspected angina.",
      vitals: "BP: 130/85, Pulse: 88, SpO2: 96%",
      procedures: "ECG performed",

      invoice_items: `
        <tr><td>Consultation</td><td>700</td></tr>
        <tr><td>ECG</td><td>400</td></tr>
    `,
      invoice_total: "1100"
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
