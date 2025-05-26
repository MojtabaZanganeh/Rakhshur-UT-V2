import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";
import { error } from "console";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, code } = body;

    let endpoint = "";
    let requestBody = {};

    switch (action) {
      case "sendCode":
        endpoint = "/auth/send-code";
        requestBody = { phone, send: false };
        break;
      case "verifyCode":
        endpoint = "/auth/verify-code";
        requestBody = { phone, code, user: false };
        break;
      case "login":
        endpoint = "/auth/verify-code";
        requestBody = { phone, code, user: true };
        break;
      case "register":
        endpoint = "/auth/register";
        requestBody = { phone, code, user: true };
        break;
      case "logout":
        endpoint = "/auth/logout";
        requestBody = { phone, code, user: true };
        break;
      default:
        return NextResponse.json({ message: "عملیات نامعتبر" }, { status: 400 });
    }

    const response = await safeJsonFetch<any>(endpoint, "POST", requestBody);

    if (!response) {
      return NextResponse.json({ message: "خطا در عملیات" });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("خطا در API احراز هویت:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
