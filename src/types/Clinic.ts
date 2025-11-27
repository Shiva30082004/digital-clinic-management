import { RowDataPacket } from "mysql2";

interface Clinic extends RowDataPacket {
  clinicID: string;
  clinicName: string;
  zipcode: string;
}

export default Clinic;
