import { RowDataPacket } from "mysql2";

interface Doctor extends RowDataPacket {
  doctorID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: string;
  specialization: string;
  clinicID: string;
  consultationFees: number;
}

export default Doctor;
