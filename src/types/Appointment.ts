import { RowDataPacket } from "mysql2";

type AppointmentStatus = "BKD" | "ACT" | "COM" | "CAN";

interface Appointment extends RowDataPacket {
  appointmentID: number;
  appointmentStatus: AppointmentStatus;
  startTime: Date | string;
  endTime: Date | string;
  patientID: number | null;
  doctorID: number;
}

export default Appointment;
export type { AppointmentStatus };
