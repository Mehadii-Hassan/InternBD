import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminPassword } from "@/lib/actions/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await verifyAdminPassword(formData);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
