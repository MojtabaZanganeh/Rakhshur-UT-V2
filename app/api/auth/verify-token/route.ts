import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";
import { User } from "@/types/user";

export async function GET(request: NextRequest) {
  return handleVerifyToken(request);
}

export async function POST(request: NextRequest) {
  return handleVerifyToken(request);
}

async function handleVerifyToken(request: NextRequest) {
  try {
    let token: string | null = null;

    const method = request.method;

    if (method === "POST") {
      const body = await request.json();
      token = body.token.value || null;
    } else if (method === "GET") {
      const cookieHeader = request.headers.get("cookie");

      if (!cookieHeader) {
        return NextResponse.json(
          { message: "کوکی‌ای وجود ندارد" },
          { status: 400 }
        );
      }

      const tokenCookie = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="));

      if (!tokenCookie) {
        return NextResponse.json({ message: "توکن یافت نشد" }, { status: 400 });
      }

      token = tokenCookie.split("=")[1];
    }

    if (!token) {
      return NextResponse.json({ message: "توکن یافت نشد" }, { status: 400 });
    }

    const response = await safeJsonFetch<{ user: User; message: string }>(
      "/auth/verify-token",
      "POST",
      { token }
    );

    if (!response || !response.message) {
      return NextResponse.json({ message: "خطا در تأیید توکن" }, { status: 401 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("خطا در بررسی توکن:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
