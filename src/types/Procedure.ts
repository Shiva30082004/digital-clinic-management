import { RowDataPacket } from "mysql2";

export interface Procedure extends RowDataPacket {
  procedureId: number;
  procedureName: string;
  amount: number;
}

export default Procedure;
