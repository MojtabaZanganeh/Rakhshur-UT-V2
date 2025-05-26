import { NextRequest, NextResponse } from "next/server";
import { safeJsonFetch } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json({ message: "شماره تلفن الزامی است" }, { status: 400 });
    }
    
    const response = await safeJsonFetch<any>("/auth/send-code", "POST", { phone, send: false });
    
    if (!response || response.message == '') {
      return NextResponse.json({ message: "خطا در ارسال کد تأیید" }, { status: 500 });
    }
        
    return NextResponse.json( response, { status: 200 });
  } catch (error) {
    console.error("خطا در ارسال کد تأیید:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}