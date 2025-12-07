import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbConnection } from '@/lib/database';
import { RowDataPacket } from 'mysql2';
import { 
  CLINIC_ID_HEADER_KEY, 
  DOCTOR_ID_HEADER_KEY, 
  ROLE_HEADER_KEY 
} from '@/constants/auth';

interface VisitData extends RowDataPacket {
  visitYear: number;
  visitMonth: number;
  totalVisits: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const conn = await getDbConnection();
  if (!conn) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  try {
    // Get clinic ID and role from headers or query params
    const clinicID = (req.headers[CLINIC_ID_HEADER_KEY] as string) || (req.query.clinicId as string);
    const role = (req.headers[ROLE_HEADER_KEY] as string) || (req.query.role as string);

    // Only admins can access visit analytics
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (!clinicID) {
      return res.status(400).json({ message: 'Clinic ID is required' });
    }

    // Optional: limit number of months to return (default to last 12 months)
    const limitMonths = req.query.limit ? parseInt(req.query.limit as string) : 12;

    // Get visits for entire clinic (excluding cancelled appointments)
    const query = `
      SELECT 
        YEAR(a.EndTime) AS visitYear, 
        MONTH(a.EndTime) AS visitMonth,
        COUNT(a.AppointmentID) AS totalVisits
      FROM Appointments a
      NATURAL JOIN Doctors d
      WHERE a.AppointmentStatus <> 'CAN' AND d.ClinicID = ?
      GROUP BY visitYear, visitMonth
      ORDER BY visitYear DESC, visitMonth DESC
      LIMIT ?
    `;
    const values = [clinicID, limitMonths];

    const [rows] = await conn.execute<VisitData[]>(query, values);

    return res.status(200).json({ 
      data: rows,
      message: `Found visit data for ${rows.length} months` 
    });
  } catch (error) {
    console.error("Error fetching visit data:", error);
    return res.status(500).json({ message: "Failed to fetch visit data" });
  } finally {
    conn.release();
  }
}
