import { RowDataPacket } from "mysql2";

export default interface Patient extends RowDataPacket {
  patientId: number;              
  firstName: string;
  lastName: string;        
  emailAddress: string;    
  gender: "M" | "F";
  dateOfBirth: string;    
  age: number;                  
  clinicId: number;
}
