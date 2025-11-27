import {
  CLINIC_ID_HEADER_KEY,
  DOCTOR_ID_HEADER_KEY,
  ROLE_HEADER_KEY
} from "@/constants/auth";
import Doctor from "@/types/Doctor";

export function getAuthHeaders(user: Partial<Doctor>, headers: Headers) {
  if (!user) return headers;

  headers.set(DOCTOR_ID_HEADER_KEY, user.doctorID!);
  headers.set(CLINIC_ID_HEADER_KEY, user.clinicID!);
  headers.set(ROLE_HEADER_KEY, user.role!);

  return headers;
}
