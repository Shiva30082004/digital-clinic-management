import { RowDataPacket } from "mysql2";

interface Clinic extends RowDataPacket {
  clinicId: string;
  clinicName: string;
  zipcode: string;
}

export default Clinic;
