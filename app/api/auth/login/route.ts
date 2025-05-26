import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";
import { User } from "@/types/user";

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { message: "شماره تلفن و کد تأیید الزامی هستند" },
        { status: 400 }
      );
    }

    const response = await safeJsonFetch<{ user: User; message: string }>(
      "/auth/login",
      "POST",
      {
        phone,
        code,
      }
    );
    if (!response || response.message == "") {
      return NextResponse.json(
        { message: "ورود با خطا مواجه شد" },
        { status: 401 }
      );
    }

    const nextResponse = NextResponse.json(response, { status: 200 });

    if (response.user && response.user.token) {
      setAuthCookie(nextResponse, response.user.token);
    }

    return nextResponse;
  } catch (error) {
    console.error("خطا در ورود:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
