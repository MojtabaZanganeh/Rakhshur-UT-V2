import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";
import { User } from "@/types/user";

export async function GET(request: NextRequest) {
  try {
    
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

    const token = tokenCookie.split("=")[1];

    const response = await safeJsonFetch<{ user: User; message: string }>(
      "/timeslots/get",
      "GET",
      undefined,
      token
    );

    if (!response || response.message == "") {
      return NextResponse.json(
        { message: "دریافت نوبت ها با خطا مواجه شد" },
        { status: 401 }
      );
    }

    const nextResponse = NextResponse.json(response, { status: 200 });

    return nextResponse;
  } catch (error) {
    console.error("خطا در ثبت نوبت ها:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
