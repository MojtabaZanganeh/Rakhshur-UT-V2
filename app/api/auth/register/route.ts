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
    const { userData } = body;

    if (!userData) {
      return NextResponse.json(
        { message: "خطا در دریافت اطلاعات کاربر" },
        { status: 400 }
      );
    }

    const response = await safeJsonFetch<{ user: User; message: string }>(
      "/auth/register",
      "POST",
      userData
    );
    if (!response || response.message == "") {
      return NextResponse.json(
        { message: "ثبت نام با خطا مواجه شد" },
        { status: 401 }
      );
    }

    const nextResponse = NextResponse.json(response, { status: 200 });

    if (response.user && response.user.token) {
      setAuthCookie(nextResponse, response.user.token);
    }

    return nextResponse;
  } catch (error) {
    console.error("خطا در ثبت نام:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
