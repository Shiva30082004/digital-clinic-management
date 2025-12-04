import { RowDataPacket } from "mysql2";

interface Consultation extends RowDataPacket {
  consultationID: number;
  appointmentID: number;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  bloodOxygen: number;
  systolicBP: number;
  diastolicBP: number;
  weight: number;
  height: number;
  chiefComplaints: string;
  diagnosis: string;
}

export default Consultation;
