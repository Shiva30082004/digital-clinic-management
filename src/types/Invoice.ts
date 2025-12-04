import { RowDataPacket } from "mysql2";

interface Invoice extends RowDataPacket {
  invoiceID: number;      // 对应 InvoiceID
  amount: number;         // 对应 Amount
  appointmentID: number;  // 对应 AppointmentID
}

export default Invoice;
