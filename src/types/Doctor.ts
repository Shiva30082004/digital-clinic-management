import { RowDataPacket } from "mysql2";

interface Doctor extends RowDataPacket {
  doctorId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: string;
  specialization: string;
  clinicId: string;
  consultationFees: number;
}

export default Doctor;
