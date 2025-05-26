import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";
import { User } from "@/types/user";

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
      "/auth/verify-code",
      "POST",
      { phone, code }
    );
    
    if (!response || response.message == "") {
      return NextResponse.json(
        { message: "بررسی کد با خطا مواجه شد" },
        { status: 401 }
      );
    }

    const nextResponse = NextResponse.json(response, { status: 200 });

    return nextResponse;
  } catch (error) {
    console.error("خطا در بررسی کد تأیید:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
