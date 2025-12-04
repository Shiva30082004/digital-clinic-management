import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFirebaseAdminAuth } from "@/utils/firebase-admin";
import { getDbConnection } from "@/lib/database";
import { getAuthHeaders } from "@/utils/auth.utils";
import Doctor from "@/types/Doctor";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.includes("/auth")) {
    return NextResponse.next();
  }

  return NextResponse.next();

  const requestHeaders = new Headers(req.headers);
  const token = requestHeaders.get("x-authorization");

  if (!token)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const auth = getFirebaseAdminAuth();

  const conn = await getDbConnection();

  if (!conn) return Response.json({}, { status: 500 });

  const decodedToken = await auth.verifyIdToken(token);

  const email = decodedToken.email;

  if (!email) {
    return Response.json(
      { error: "Email address is required" },
      { status: 400 }
    );
  }

  const query =
    "SELECT DoctorId, ClinicId, Role FROM Doctors WHERE EmailAddress = ?;";
  const values = [email];

  const [rows] = await conn.execute<Doctor[]>(query, values);

  if (Array.isArray(rows) && rows.length > 0) {
    const [user = {}] = rows || [];

    const authHeaders = getAuthHeaders(user, requestHeaders);

    return NextResponse.next({
      request: {
        headers: authHeaders
      }
    });
  } else {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: "/api/:route*",
  runtime: "nodejs"
};
