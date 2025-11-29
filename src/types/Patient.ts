type Patient = {
  patientId: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  gender: "M" | "F";
  dateOfBirth: string;
  age: number;
  clinicId: number;
};

export default Patient;
