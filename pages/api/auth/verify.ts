import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "../../../utils/authUtils";

export const runtime = "edge";

export default async function handler(req: NextRequest) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "No valid authorization header",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userData = await verifyAuthToken(token);

    if (!userData) {
      return NextResponse.json(
        {
          error: "Invalid or expired token",
          authenticated: false,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: userData,
        message: "Token valid",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        verified: false,
      },
      { status: 500 }
    );
  }
}
