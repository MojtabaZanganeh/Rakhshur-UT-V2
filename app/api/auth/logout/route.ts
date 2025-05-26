import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: "خروج با موفقیت انجام شد" },
      { status: 200 }
    );

    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("خطا در خروج:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}