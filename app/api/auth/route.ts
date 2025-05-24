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
      case "login":
        endpoint = "/auth/login";
        requestBody = { phone, code, user: true };
        break;
      default:
        return NextResponse.json({ error: "عملیات نامعتبر" }, { status: 400 });
    }

    const response = await safeJsonFetch<{ message: string }>(
      endpoint,
      "POST",
      requestBody
    );
    console.log('route:' + response)

    if (!response) {
      return NextResponse.json({ error: "خطا در عملیات" });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("خطا در API احراز هویت:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
