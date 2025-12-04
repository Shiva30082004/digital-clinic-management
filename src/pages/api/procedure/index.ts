import type { NextApiRequest, NextApiResponse } from "next";
import { getDbConnection } from "@/lib/database";
import ApiResponse from "@/types/ApiResponse";
import Procedure from "@/types/Procedure";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Procedure[]>>
) {
  if (req.method === "GET") {
    const conn = await getDbConnection();
    if (!conn) return res.status(500).end();

    try {
      const query = `
        SELECT 
          ProcedureID AS procedureId,
          ProcedureName AS procedureName,
          Amount AS amount
        FROM Procedures
        ORDER BY ProcedureName
      `;

      const [rows] = await conn.execute<Procedure[]>(query);
      conn.release();

      return res.status(200).json({
        data: rows,
      });
    } catch (err) {
      console.error("GET procedures error:", err);
      try {
        conn.release();
      } catch {}
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
