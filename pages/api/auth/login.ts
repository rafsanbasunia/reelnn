import { NextRequest, NextResponse } from "next/server";
import { TELEGRAM_BOT_TOKEN } from "@/config";
import { generateAuthToken } from "@/utils/authUtils";
import { verifyUserWithBackend } from "@/utils/userVerification";

export const runtime = "edge";

interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const authData: TelegramAuthData = await req.json();

    const isValid = await verifyTelegramAuth(authData);

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Authentication verification failed",
          verified: false,
        },
        { status: 401 }
      );
    }

    const authDate = parseInt(authData.auth_date);
    const currentTime = Math.floor(Date.now() / 1000);
    const oneDay = 86400;

    if (currentTime - authDate > oneDay) {
      return NextResponse.json(
        {
          error: "Authentication data is too old",
          verified: false,
        },
        { status: 401 }
      );
    }

    const backendVerification = await verifyUserWithBackend(authData.id);

    if (!backendVerification.success) {
      if (backendVerification.error?.includes("not found")) {
        return NextResponse.json(
          {
            error: "User not found",
            verified: false,
            userNotFound: true,
          },
          { status: 404 }
        );
      } else if (backendVerification.error?.includes("Invalid token")) {
        return NextResponse.json(
          {
            error: "Token verification failed",
            verified: false,
          },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          {
            error: backendVerification.error || "Backend verification failed",
            verified: false,
          },
          { status: 400 }
        );
      }
    }

    if (!backendVerification.user?.is_active) {
      return NextResponse.json(
        {
          error: "Account disabled",
          verified: false,
          accountDisabled: true,
        },
        { status: 403 }
      );
    }

    const userInfo = {
      id: authData.id,
      firstName: authData.first_name,
      lastName: authData.last_name || undefined,
      username: authData.username || undefined,
      photoUrl: authData.photo_url || undefined,
      authDate: new Date(authDate * 1000).toISOString(),
    };

    const authToken = await generateAuthToken(userInfo);

    return NextResponse.json(
      {
        verified: true,
        user: userInfo,
        backendUser: backendVerification.user,
        token: authToken,
        message: "Authentication successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        verified: false,
      },
      { status: 500 }
    );
  }
}

async function verifyTelegramAuth(
  authData: TelegramAuthData
): Promise<boolean> {
  try {
    const botToken = TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return false;
    }

    const { hash, ...dataToCheck } = authData;

    if (!hash) {
      return false;
    }

    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map((key) => `${key}=${dataToCheck[key as keyof typeof dataToCheck]}`)
      .join("\n");

    const encoder = new TextEncoder();
    const botTokenData = encoder.encode(botToken);
    const secretKeyBuffer = await crypto.subtle.digest("SHA-256", botTokenData);

    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(dataCheckString)
    );

    const hashArray = Array.from(new Uint8Array(signature));
    const calculatedHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return calculatedHash === hash;
  } catch (error) {
    return false;
  }
}
